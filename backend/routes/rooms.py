"""
Room routes for DoctorCRM API.
Handles CRUD operations for rooms/locations.
"""
from flask import Blueprint, request, jsonify
from models import db, Room
from datetime import datetime

rooms_bp = Blueprint('rooms', __name__, url_prefix='/api/rooms')


@rooms_bp.route('', methods=['GET'])
def get_all_rooms():
    """
    Get all rooms.
    Query params: organization_id (required), active_only, available_only, include_stats
    """
    try:
        organization_id = request.args.get('organization_id', type=int)
        
        if not organization_id:
            return jsonify({
                'success': False,
                'error': 'organization_id is required'
            }), 400
        
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        available_only = request.args.get('available_only', 'false').lower() == 'true'
        include_stats = request.args.get('include_stats', 'false').lower() == 'true'
        
        if available_only:
            rooms = Room.get_available(organization_id)
        else:
            rooms = Room.get_by_organization(organization_id, include_inactive=not active_only)
        
        return jsonify({
            'success': True,
            'data': [room.to_dict(include_stats=include_stats) for room in rooms],
            'count': len(rooms)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@rooms_bp.route('/<int:room_id>', methods=['GET'])
def get_room(room_id):
    """Get a single room by ID"""
    try:
        include_organization = request.args.get('include_organization', 'false').lower() == 'true'
        include_stats = request.args.get('include_stats', 'false').lower() == 'true'
        
        room = Room.query.get(room_id)
        
        if not room:
            return jsonify({
                'success': False,
                'error': 'Room not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': room.to_dict(include_organization=include_organization, include_stats=include_stats)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@rooms_bp.route('', methods=['POST'])
def create_room():
    """Create a new room"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['organization_id', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Check if room with same name exists in organization
        existing = Room.query.filter_by(
            organization_id=data['organization_id'],
            name=data['name']
        ).first()
        
        if existing:
            return jsonify({
                'success': False,
                'error': f'Room with name "{data["name"]}" already exists in this organization'
            }), 409
        
        # Create new room
        room = Room(
            organization_id=data['organization_id'],
            name=data['name'],
            description=data.get('description'),
            identifier=data.get('identifier'),
            room_type=data.get('room_type', 'examination'),
            floor=data.get('floor'),
            building=data.get('building'),
            capacity=data.get('capacity', 1),
            has_equipment=data.get('has_equipment', False),
            equipment_list=data.get('equipment_list'),
            is_accessible=data.get('is_accessible', True),
            accessibility_notes=data.get('accessibility_notes'),
            is_virtual=data.get('is_virtual', False),
            virtual_link_template=data.get('virtual_link_template'),
            is_available=data.get('is_available', True),
            availability_notes=data.get('availability_notes'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(room)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Room created successfully',
            'data': room.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@rooms_bp.route('/<int:room_id>', methods=['PUT'])
def update_room(room_id):
    """Update an existing room"""
    try:
        room = Room.query.get(room_id)
        
        if not room:
            return jsonify({
                'success': False,
                'error': 'Room not found'
            }), 404
        
        data = request.get_json()
        
        # Check if new name conflicts with existing room in same organization
        if 'name' in data and data['name'] != room.name:
            existing = Room.query.filter_by(
                organization_id=room.organization_id,
                name=data['name']
            ).first()
            
            if existing:
                return jsonify({
                    'success': False,
                    'error': f'Room with name "{data["name"]}" already exists in this organization'
                }), 409
        
        # Update fields
        if 'name' in data:
            room.name = data['name']
        if 'description' in data:
            room.description = data['description']
        if 'identifier' in data:
            room.identifier = data['identifier']
        if 'room_type' in data:
            room.room_type = data['room_type']
        if 'floor' in data:
            room.floor = data['floor']
        if 'building' in data:
            room.building = data['building']
        if 'capacity' in data:
            room.capacity = data['capacity']
        if 'has_equipment' in data:
            room.has_equipment = data['has_equipment']
        if 'equipment_list' in data:
            room.equipment_list = data['equipment_list']
        if 'is_accessible' in data:
            room.is_accessible = data['is_accessible']
        if 'accessibility_notes' in data:
            room.accessibility_notes = data['accessibility_notes']
        if 'is_virtual' in data:
            room.is_virtual = data['is_virtual']
        if 'virtual_link_template' in data:
            room.virtual_link_template = data['virtual_link_template']
        if 'is_available' in data:
            room.is_available = data['is_available']
        if 'availability_notes' in data:
            room.availability_notes = data['availability_notes']
        if 'is_active' in data:
            room.is_active = data['is_active']
        
        room.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Room updated successfully',
            'data': room.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@rooms_bp.route('/<int:room_id>', methods=['DELETE'])
def delete_room(room_id):
    """Delete a room (soft delete by setting is_active=False)"""
    try:
        room = Room.query.get(room_id)
        
        if not room:
            return jsonify({
                'success': False,
                'error': 'Room not found'
            }), 404
        
        # Check if room has appointments
        if room.appointment_count > 0:
            # Soft delete instead of hard delete
            room.is_active = False
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Room deactivated (has associated appointments)'
            }), 200
        
        # Hard delete if no appointments
        db.session.delete(room)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Room deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
