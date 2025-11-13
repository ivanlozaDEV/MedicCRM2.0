"""
Condition Catalog routes for DoctorCRM API.
Handles CRUD operations for the global conditions catalog.
"""
from flask import Blueprint, request, jsonify
from models import db, Condition
from datetime import datetime

conditions_bp = Blueprint('conditions', __name__, url_prefix='/api/conditions')


@conditions_bp.route('', methods=['GET'])
def get_all_conditions():
    """
    Get all conditions from catalog.
    Query params: category, search, only_active, is_chronic
    """
    try:
        category = request.args.get('category')
        search = request.args.get('search', '').strip()
        only_active = request.args.get('only_active', 'true').lower() == 'true'
        is_chronic = request.args.get('is_chronic')
        
        query = Condition.query
        
        if only_active:
            query = query.filter_by(is_active=True)
        
        if category:
            query = query.filter_by(category=category)
        
        if is_chronic is not None:
            chronic_value = is_chronic.lower() == 'true'
            query = query.filter_by(is_chronic=chronic_value)
        
        # Search by name or description
        if search:
            search_filter = db.or_(
                Condition.name.ilike(f'%{search}%'),
                Condition.description.ilike(f'%{search}%'),
                Condition.icd10_code.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)
        
        conditions = query.order_by(Condition.category, Condition.name).all()
        
        return jsonify({
            'success': True,
            'data': [condition.to_dict() for condition in conditions],
            'count': len(conditions)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@conditions_bp.route('/<int:condition_id>', methods=['GET'])
def get_condition(condition_id):
    """Get a single condition by ID"""
    try:
        condition = Condition.query.get(condition_id)
        
        if not condition:
            return jsonify({
                'success': False,
                'error': 'Condition not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': condition.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@conditions_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all unique condition categories"""
    try:
        categories = Condition.get_all_categories()
        
        return jsonify({
            'success': True,
            'data': categories,
            'count': len(categories)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@conditions_bp.route('/search', methods=['GET'])
def search_conditions():
    """
    Search conditions by name
    Query params: q (query string), limit
    """
    try:
        query_string = request.args.get('q', '').strip()
        limit = int(request.args.get('limit', 10))
        
        if not query_string:
            return jsonify({
                'success': False,
                'error': 'Query parameter "q" is required'
            }), 400
        
        conditions = Condition.search_by_name(query_string, limit=limit)
        
        return jsonify({
            'success': True,
            'data': [condition.to_dict() for condition in conditions],
            'count': len(conditions)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@conditions_bp.route('', methods=['POST'])
def create_condition():
    """Create a new condition in the catalog (admin only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({
                'success': False,
                'error': 'Name is required'
            }), 400
        
        # Check if condition already exists
        existing = Condition.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({
                'success': False,
                'error': 'Condition with this name already exists'
            }), 409
        
        # Create new condition
        condition = Condition(
            name=data['name'],
            description=data.get('description'),
            icd10_code=data.get('icd10_code'),
            snomed_code=data.get('snomed_code'),
            category=data.get('category'),
            typical_severity=data.get('typical_severity'),
            is_chronic=data.get('is_chronic', True),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(condition)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Condition created successfully',
            'data': condition.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@conditions_bp.route('/<int:condition_id>', methods=['PUT'])
def update_condition(condition_id):
    """Update a condition in the catalog (admin only)"""
    try:
        condition = Condition.query.get(condition_id)
        
        if not condition:
            return jsonify({
                'success': False,
                'error': 'Condition not found'
            }), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            # Check if new name conflicts with existing condition
            existing = Condition.query.filter(
                Condition.id != condition_id,
                Condition.name == data['name']
            ).first()
            if existing:
                return jsonify({
                    'success': False,
                    'error': 'Condition with this name already exists'
                }), 409
            condition.name = data['name']
        
        if 'description' in data:
            condition.description = data['description']
        if 'icd10_code' in data:
            condition.icd10_code = data['icd10_code']
        if 'snomed_code' in data:
            condition.snomed_code = data['snomed_code']
        if 'category' in data:
            condition.category = data['category']
        if 'typical_severity' in data:
            condition.typical_severity = data['typical_severity']
        if 'is_chronic' in data:
            condition.is_chronic = data['is_chronic']
        if 'is_active' in data:
            condition.is_active = data['is_active']
        
        condition.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Condition updated successfully',
            'data': condition.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@conditions_bp.route('/<int:condition_id>', methods=['DELETE'])
def delete_condition(condition_id):
    """
    Soft delete a condition (set is_active to False) (admin only)
    This is safer than hard delete as patient records may reference it.
    """
    try:
        condition = Condition.query.get(condition_id)
        
        if not condition:
            return jsonify({
                'success': False,
                'error': 'Condition not found'
            }), 404
        
        # Soft delete
        condition.is_active = False
        condition.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Condition deactivated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@conditions_bp.route('/stats', methods=['GET'])
def get_statistics():
    """Get statistics about the conditions catalog"""
    try:
        total = Condition.query.count()
        active = Condition.query.filter_by(is_active=True).count()
        chronic = Condition.query.filter_by(is_chronic=True, is_active=True).count()
        
        # Count by category
        categories = {}
        for condition in Condition.query.filter_by(is_active=True).all():
            cat = condition.category or 'uncategorized'
            categories[cat] = categories.get(cat, 0) + 1
        
        # Count by severity
        severities = {}
        for condition in Condition.query.filter_by(is_active=True).all():
            sev = condition.typical_severity or 'unspecified'
            severities[sev] = severities.get(sev, 0) + 1
        
        return jsonify({
            'success': True,
            'data': {
                'total': total,
                'active': active,
                'inactive': total - active,
                'chronic': chronic,
                'acute': active - chronic,
                'by_category': categories,
                'by_severity': severities
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
