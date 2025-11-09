"""
Permission routes for DoctorCRM API.
Handles CRUD operations for permissions.
"""
from flask import Blueprint, request, jsonify
from models import db, Permission
from datetime import datetime

permissions_bp = Blueprint('permissions', __name__, url_prefix='/api/permissions')


@permissions_bp.route('', methods=['GET'])
def get_all_permissions():
    """
    Get all permissions.
    Query params: category, grouped
    """
    try:
        category = request.args.get('category')
        grouped = request.args.get('grouped', 'false').lower() == 'true'
        
        if grouped:
            # Return permissions grouped by category
            permissions_grouped = Permission.get_all_grouped()
            return jsonify({
                'success': True,
                'data': permissions_grouped
            }), 200
        
        if category:
            permissions = Permission.find_by_category(category)
        else:
            permissions = Permission.get_all()
        
        return jsonify({
            'success': True,
            'data': [perm.to_dict() for perm in permissions],
            'count': len(permissions)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@permissions_bp.route('/<int:permission_id>', methods=['GET'])
def get_permission(permission_id):
    """Get a single permission by ID"""
    try:
        permission = Permission.query.get(permission_id)
        
        if not permission:
            return jsonify({
                'success': False,
                'error': 'Permission not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': permission.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@permissions_bp.route('/key/<string:module_key>', methods=['GET'])
def get_permission_by_key(module_key):
    """Get a permission by module key"""
    try:
        permission = Permission.find_by_key(module_key)
        
        if not permission:
            return jsonify({
                'success': False,
                'error': 'Permission not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': permission.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@permissions_bp.route('', methods=['POST'])
def create_permission():
    """
    Create a new permission.
    Required: module_key, display_name, category
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        required_fields = ['module_key', 'display_name', 'category']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        permission = Permission.create(
            module_key=data['module_key'],
            display_name=data['display_name'],
            category=data['category'],
            description=data.get('description')
        )
        
        return jsonify({
            'success': True,
            'message': 'Permission created successfully',
            'data': permission.to_dict()
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


@permissions_bp.route('/<int:permission_id>', methods=['PUT', 'PATCH'])
def update_permission(permission_id):
    """Update a permission"""
    try:
        permission = Permission.query.get(permission_id)
        
        if not permission:
            return jsonify({
                'success': False,
                'error': 'Permission not found'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        permission.update(**data)
        
        return jsonify({
            'success': True,
            'message': 'Permission updated successfully',
            'data': permission.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@permissions_bp.route('/<int:permission_id>', methods=['DELETE'])
def delete_permission(permission_id):
    """Delete a permission"""
    try:
        permission = Permission.query.get(permission_id)
        
        if not permission:
            return jsonify({
                'success': False,
                'error': 'Permission not found'
            }), 404
        
        permission.delete()
        
        return jsonify({
            'success': True,
            'message': 'Permission deleted successfully'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@permissions_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get list of available permission categories"""
    try:
        return jsonify({
            'success': True,
            'data': Permission.CATEGORIES
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
