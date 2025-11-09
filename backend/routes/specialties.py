"""
Specialty routes for DoctorCRM API.
Handles CRUD operations for medical specialties.
"""
from flask import Blueprint, request, jsonify
from models import db, Specialty
from datetime import datetime

specialties_bp = Blueprint('specialties', __name__, url_prefix='/api/specialties')


@specialties_bp.route('', methods=['GET'])
def get_all_specialties():
    """
    Get all specialties.
    Query params: active_only
    """
    try:
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        
        specialties = Specialty.get_all(active_only=active_only)
        
        return jsonify({
            'success': True,
            'data': [specialty.to_dict() for specialty in specialties],
            'count': len(specialties)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@specialties_bp.route('/<int:specialty_id>', methods=['GET'])
def get_specialty(specialty_id):
    """Get a single specialty by ID"""
    try:
        specialty = Specialty.query.get(specialty_id)
        
        if not specialty:
            return jsonify({
                'success': False,
                'error': 'Specialty not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': specialty.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@specialties_bp.route('/name/<string:name>', methods=['GET'])
def get_specialty_by_name(name):
    """Get a specialty by name"""
    try:
        specialty = Specialty.find_by_name(name)
        
        if not specialty:
            return jsonify({
                'success': False,
                'error': 'Specialty not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': specialty.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@specialties_bp.route('', methods=['POST'])
def create_specialty():
    """
    Create a new specialty.
    Required: name
    """
    try:
        data = request.get_json()
        
        if not data or 'name' not in data:
            return jsonify({
                'success': False,
                'error': 'Specialty name is required'
            }), 400
        
        specialty = Specialty.create(**data)
        
        return jsonify({
            'success': True,
            'message': 'Specialty created successfully',
            'data': specialty.to_dict()
        }), 201
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@specialties_bp.route('/<int:specialty_id>', methods=['PUT', 'PATCH'])
def update_specialty(specialty_id):
    """Update a specialty"""
    try:
        specialty = Specialty.query.get(specialty_id)
        
        if not specialty:
            return jsonify({
                'success': False,
                'error': 'Specialty not found'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        specialty.update(**data)
        
        return jsonify({
            'success': True,
            'message': 'Specialty updated successfully',
            'data': specialty.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@specialties_bp.route('/<int:specialty_id>/deactivate', methods=['POST'])
def deactivate_specialty(specialty_id):
    """Deactivate a specialty (soft delete)"""
    try:
        specialty = Specialty.query.get(specialty_id)
        
        if not specialty:
            return jsonify({
                'success': False,
                'error': 'Specialty not found'
            }), 404
        
        specialty.deactivate()
        
        return jsonify({
            'success': True,
            'message': 'Specialty deactivated successfully',
            'data': specialty.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@specialties_bp.route('/<int:specialty_id>/activate', methods=['POST'])
def activate_specialty(specialty_id):
    """Activate a specialty"""
    try:
        specialty = Specialty.query.get(specialty_id)
        
        if not specialty:
            return jsonify({
                'success': False,
                'error': 'Specialty not found'
            }), 404
        
        specialty.activate()
        
        return jsonify({
            'success': True,
            'message': 'Specialty activated successfully',
            'data': specialty.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@specialties_bp.route('/<int:specialty_id>', methods=['DELETE'])
def delete_specialty(specialty_id):
    """Delete a specialty permanently"""
    try:
        specialty = Specialty.query.get(specialty_id)
        
        if not specialty:
            return jsonify({
                'success': False,
                'error': 'Specialty not found'
            }), 404
        
        specialty.delete()
        
        return jsonify({
            'success': True,
            'message': 'Specialty deleted successfully'
        }), 200
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@specialties_bp.route('/init-defaults', methods=['POST'])
def initialize_default_specialties():
    """Create default specialties"""
    try:
        specialties = Specialty.create_default_specialties()
        
        return jsonify({
            'success': True,
            'message': f'Created {len(specialties)} default specialties',
            'data': [specialty.to_dict() for specialty in specialties]
        }), 201
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
