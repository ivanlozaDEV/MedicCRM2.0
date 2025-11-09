"""
Permission routes for DoctorCRM API.
Read-only endpoints for permissions.
Permissions are hardcoded in the system and cannot be modified by users.
Users can only assign permissions to roles via the roles endpoints.
"""
from flask import Blueprint, request, jsonify
from models import db, Permission
from datetime import datetime

permissions_bp = Blueprint('permissions', __name__, url_prefix='/api/permissions')


@permissions_bp.route('', methods=['GET'])
def get_all_permissions():
    """
    Get all permissions (read-only).
    Query params: category, grouped
    
    Note: Permissions cannot be created, updated, or deleted.
    They are hardcoded in the system based on the database structure.
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
    """Get a single permission by ID (read-only)"""
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
    """Get a permission by module key (read-only)"""
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


@permissions_bp.route('/categories', methods=['GET'])
def get_categories():
    """
    Get list of available permission categories (read-only).
    Returns the three categories: system, clinical, administrative
    """
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

        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
