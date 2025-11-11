from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Medication, User
from sqlalchemy import or_

medications_bp = Blueprint('medications', __name__)


@medications_bp.route('/api/medications', methods=['GET'])
@jwt_required()
def get_medications():
    """
    Get all medications from the catalog with optional filtering.
    Query params:
    - search: Search by name, generic_name, or brand_names
    - category: Filter by category
    - is_active: Filter by active status (true/false)
    """
    try:
        # Get query parameters
        search = request.args.get('search', '').strip()
        category = request.args.get('category', '').strip()
        is_active_param = request.args.get('is_active', '').strip()
        
        # Base query
        query = Medication.query
        
        # Apply filters
        if search:
            search_filter = or_(
                Medication.name.ilike(f'%{search}%'),
                Medication.generic_name.ilike(f'%{search}%'),
                db.cast(Medication.brand_names, db.String).ilike(f'%{search}%'),
                Medication.drug_class.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)
        
        if category:
            query = query.filter(Medication.category == category)
        
        if is_active_param:
            is_active = is_active_param.lower() == 'true'
            query = query.filter(Medication.is_active == is_active)
        
        # Execute query and order by name
        medications = query.order_by(Medication.name).all()
        
        return jsonify({
            'success': True,
            'data': [med.to_dict() for med in medications],
            'count': len(medications)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@medications_bp.route('/api/medications/<int:medication_id>', methods=['GET'])
@jwt_required()
def get_medication(medication_id):
    """Get a specific medication by ID."""
    try:
        medication = Medication.query.get(medication_id)
        
        if not medication:
            return jsonify({
                'success': False,
                'error': 'Medication not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': medication.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@medications_bp.route('/api/medications', methods=['POST'])
@jwt_required()
def create_medication():
    """Create a new medication in the catalog."""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({
                'success': False,
                'error': 'Medication name is required'
            }), 400
        
        # Check if medication with same name already exists
        existing = Medication.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({
                'success': False,
                'error': f'Medication with name "{data["name"]}" already exists'
            }), 409
        
        # Create medication
        medication = Medication.create(data)
        
        return jsonify({
            'success': True,
            'data': medication.to_dict(),
            'message': 'Medication created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@medications_bp.route('/api/medications/<int:medication_id>', methods=['PUT'])
@jwt_required()
def update_medication(medication_id):
    """Update an existing medication."""
    try:
        medication = Medication.query.get(medication_id)
        
        if not medication:
            return jsonify({
                'success': False,
                'error': 'Medication not found'
            }), 404
        
        data = request.get_json()
        
        # Check for duplicate name if name is being changed
        if 'name' in data and data['name'] != medication.name:
            existing = Medication.query.filter_by(name=data['name']).first()
            if existing:
                return jsonify({
                    'success': False,
                    'error': f'Medication with name "{data["name"]}" already exists'
                }), 409
        
        # Update medication
        medication.update(data)
        
        return jsonify({
            'success': True,
            'data': medication.to_dict(),
            'message': 'Medication updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@medications_bp.route('/api/medications/<int:medication_id>', methods=['DELETE'])
@jwt_required()
def delete_medication(medication_id):
    """Soft delete a medication (mark as inactive)."""
    try:
        medication = Medication.query.get(medication_id)
        
        if not medication:
            return jsonify({
                'success': False,
                'error': 'Medication not found'
            }), 404
        
        # Soft delete
        medication.delete()
        
        return jsonify({
            'success': True,
            'message': 'Medication deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@medications_bp.route('/api/medications/categories', methods=['GET'])
@jwt_required()
def get_medication_categories():
    """Get all unique medication categories."""
    try:
        categories = db.session.query(Medication.category)\
            .filter(Medication.category.isnot(None))\
            .filter(Medication.is_active == True)\
            .distinct()\
            .order_by(Medication.category)\
            .all()
        
        category_list = [cat[0] for cat in categories if cat[0]]
        
        return jsonify({
            'success': True,
            'data': category_list,
            'count': len(category_list)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
