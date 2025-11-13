"""
Appointment Type routes for DoctorCRM API.
Handles CRUD operations for appointment types.
"""
from flask import Blueprint, request, jsonify
from models import db, AppointmentType
from datetime import datetime

appointment_types_bp = Blueprint('appointment_types', __name__, url_prefix='/api/appointment-types')


@appointment_types_bp.route('', methods=['GET'])
def get_all_appointment_types():
    """
    Get all appointment types.
    Query params: active_only, include_stats
    """
    try:
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        include_stats = request.args.get('include_stats', 'false').lower() == 'true'
        
        if active_only:
            appointment_types = AppointmentType.get_active()
        else:
            appointment_types = AppointmentType.query.order_by(AppointmentType.name).all()
        
        return jsonify({
            'success': True,
            'data': [apt.to_dict(include_stats=include_stats) for apt in appointment_types],
            'count': len(appointment_types)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointment_types_bp.route('/<int:appointment_type_id>', methods=['GET'])
def get_appointment_type(appointment_type_id):
    """Get a single appointment type by ID"""
    try:
        include_stats = request.args.get('include_stats', 'false').lower() == 'true'
        
        appointment_type = AppointmentType.query.get(appointment_type_id)
        
        if not appointment_type:
            return jsonify({
                'success': False,
                'error': 'Appointment type not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': appointment_type.to_dict(include_stats=include_stats)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointment_types_bp.route('', methods=['POST'])
def create_appointment_type():
    """Create a new appointment type"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'default_duration']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Check if appointment type with same name already exists
        existing = AppointmentType.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({
                'success': False,
                'error': f'Appointment type with name "{data["name"]}" already exists'
            }), 409
        
        # Create new appointment type
        appointment_type = AppointmentType(
            name=data['name'],
            description=data.get('description'),
            code=data.get('code'),
            system=data.get('system'),
            default_duration=data['default_duration'],
            color=data.get('color', '#3B82F6'),
            icon=data.get('icon', 'calendar'),
            requires_preparation=data.get('requires_preparation', False),
            preparation_instructions=data.get('preparation_instructions'),
            is_virtual=data.get('is_virtual', False),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(appointment_type)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Appointment type created successfully',
            'data': appointment_type.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointment_types_bp.route('/<int:appointment_type_id>', methods=['PUT'])
def update_appointment_type(appointment_type_id):
    """Update an existing appointment type"""
    try:
        appointment_type = AppointmentType.query.get(appointment_type_id)
        
        if not appointment_type:
            return jsonify({
                'success': False,
                'error': 'Appointment type not found'
            }), 404
        
        data = request.get_json()
        
        # Check if new name conflicts with existing
        if 'name' in data and data['name'] != appointment_type.name:
            existing = AppointmentType.query.filter_by(name=data['name']).first()
            if existing:
                return jsonify({
                    'success': False,
                    'error': f'Appointment type with name "{data["name"]}" already exists'
                }), 409
        
        # Update fields
        if 'name' in data:
            appointment_type.name = data['name']
        if 'description' in data:
            appointment_type.description = data['description']
        if 'code' in data:
            appointment_type.code = data['code']
        if 'system' in data:
            appointment_type.system = data['system']
        if 'default_duration' in data:
            appointment_type.default_duration = data['default_duration']
        if 'color' in data:
            appointment_type.color = data['color']
        if 'icon' in data:
            appointment_type.icon = data['icon']
        if 'requires_preparation' in data:
            appointment_type.requires_preparation = data['requires_preparation']
        if 'preparation_instructions' in data:
            appointment_type.preparation_instructions = data['preparation_instructions']
        if 'is_virtual' in data:
            appointment_type.is_virtual = data['is_virtual']
        if 'is_active' in data:
            appointment_type.is_active = data['is_active']
        
        appointment_type.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Appointment type updated successfully',
            'data': appointment_type.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointment_types_bp.route('/<int:appointment_type_id>', methods=['DELETE'])
def delete_appointment_type(appointment_type_id):
    """Delete an appointment type (soft delete by setting is_active=False)"""
    try:
        appointment_type = AppointmentType.query.get(appointment_type_id)
        
        if not appointment_type:
            return jsonify({
                'success': False,
                'error': 'Appointment type not found'
            }), 404
        
        # Check if appointment type is being used
        if appointment_type.appointment_count > 0:
            # Soft delete instead of hard delete
            appointment_type.is_active = False
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Appointment type deactivated (has associated appointments)'
            }), 200
        
        # Hard delete if no appointments
        db.session.delete(appointment_type)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Appointment type deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
