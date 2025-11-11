"""
Allergy Catalog routes for DoctorCRM API.
Handles CRUD operations for the global allergy catalog.
"""
from flask import Blueprint, request, jsonify
from models import db, Allergy
from datetime import datetime

allergies_bp = Blueprint('allergies', __name__, url_prefix='/api/allergies')


@allergies_bp.route('', methods=['GET'])
def get_all_allergies():
    """
    Get all allergies from catalog.
    Query params: category, search, only_active
    """
    try:
        category = request.args.get('category')
        search = request.args.get('search', '').strip()
        only_active = request.args.get('only_active', 'true').lower() == 'true'
        
        query = Allergy.query
        
        if only_active:
            query = query.filter_by(is_active=True)
        
        if category:
            query = query.filter_by(category=category)
        
        # Search by name or description
        if search:
            search_filter = db.or_(
                Allergy.name.ilike(f'%{search}%'),
                Allergy.description.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)
        
        allergies = query.order_by(Allergy.category, Allergy.name).all()
        
        return jsonify({
            'success': True,
            'data': [allergy.to_dict() for allergy in allergies],
            'count': len(allergies)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@allergies_bp.route('/<int:allergy_id>', methods=['GET'])
def get_allergy(allergy_id):
    """Get a single allergy by ID"""
    try:
        allergy = Allergy.query.get(allergy_id)
        
        if not allergy:
            return jsonify({
                'success': False,
                'error': 'Allergy not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': allergy.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@allergies_bp.route('', methods=['POST'])
def create_allergy():
    """Create a new allergy in catalog (admin only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'name' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: name'
            }), 400
        
        # Check if allergy name already exists
        existing = Allergy.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({
                'success': False,
                'error': 'An allergy with this name already exists'
            }), 400
        
        allergy = Allergy.create(data)
        
        return jsonify({
            'success': True,
            'data': allergy.to_dict(),
            'message': 'Allergy created successfully'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@allergies_bp.route('/<int:allergy_id>', methods=['PUT'])
def update_allergy(allergy_id):
    """Update an allergy in catalog (admin only)"""
    try:
        allergy = Allergy.query.get(allergy_id)
        
        if not allergy:
            return jsonify({
                'success': False,
                'error': 'Allergy not found'
            }), 404
        
        data = request.get_json()
        
        # Check if new name conflicts with existing allergy
        if 'name' in data and data['name'] != allergy.name:
            existing = Allergy.query.filter_by(name=data['name']).first()
            if existing:
                return jsonify({
                    'success': False,
                    'error': 'An allergy with this name already exists'
                }), 400
        
        allergy.update(data)
        
        return jsonify({
            'success': True,
            'data': allergy.to_dict(),
            'message': 'Allergy updated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@allergies_bp.route('/<int:allergy_id>', methods=['DELETE'])
def delete_allergy(allergy_id):
    """
    Soft delete an allergy from catalog (admin only).
    This marks the allergy as inactive instead of deleting it.
    """
    try:
        allergy = Allergy.query.get(allergy_id)
        
        if not allergy:
            return jsonify({
                'success': False,
                'error': 'Allergy not found'
            }), 404
        
        allergy.delete()
        
        return jsonify({
            'success': True,
            'message': 'Allergy deactivated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@allergies_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get list of unique allergy categories"""
    try:
        # Query distinct categories from active allergies
        categories = db.session.query(Allergy.category).filter(
            Allergy.category.isnot(None),
            Allergy.is_active == True
        ).distinct().all()
        
        # Extract category names from tuples
        category_list = [cat[0] for cat in categories if cat[0]]
        category_list.sort()
        
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
