"""
RolePermission routes for DoctorCRM API.
Handles permission assignment to roles.
"""
from flask import Blueprint, request, jsonify
from models import db, RolePermission, Role, Permission
from datetime import datetime

role_permissions_bp = Blueprint('role_permissions', __name__, url_prefix='/api/role-permissions')


@role_permissions_bp.route('/role/<int:role_id>', methods=['GET'])
def get_role_permissions(role_id):
    """Get all permissions assigned to a role"""
    try:
        role = Role.query.get(role_id)
        
        if not role:
            return jsonify({
                'success': False,
                'error': 'Role not found'
            }), 404
        
        permissions = RolePermission.get_role_permissions(role_id)
        
        return jsonify({
            'success': True,
            'data': {
                'role': role.to_dict(),
                'permissions': [perm.to_dict() for perm in permissions],
                'count': len(permissions)
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@role_permissions_bp.route('/permission/<int:permission_id>/roles', methods=['GET'])
def get_permission_roles(permission_id):
    """Get all roles that have a specific permission"""
    try:
        permission = Permission.query.get(permission_id)
        
        if not permission:
            return jsonify({
                'success': False,
                'error': 'Permission not found'
            }), 404
        
        roles = RolePermission.get_permission_roles(permission_id)
        
        return jsonify({
            'success': True,
            'data': {
                'permission': permission.to_dict(),
                'roles': [role.to_dict() for role in roles],
                'count': len(roles)
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@role_permissions_bp.route('/assign', methods=['POST'])
def assign_permission():
    """
    Assign a permission to a role.
    Required: role_id, permission_id
    Optional: assigned_by
    """
    try:
        data = request.get_json()
        
        if not data or 'role_id' not in data or 'permission_id' not in data:
            return jsonify({
                'success': False,
                'error': 'role_id and permission_id are required'
            }), 400
        
        assignment = RolePermission.assign_permission(
            role_id=data['role_id'],
            permission_id=data['permission_id'],
            assigned_by=data.get('assigned_by')
        )
        
        return jsonify({
            'success': True,
            'message': 'Permission assigned successfully',
            'data': assignment.to_dict()
        }), 201
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@role_permissions_bp.route('/assign-multiple', methods=['POST'])
def assign_multiple_permissions():
    """
    Assign multiple permissions to a role at once.
    Required: role_id, permission_ids (array)
    Optional: assigned_by
    """
    try:
        data = request.get_json()
        
        if not data or 'role_id' not in data or 'permission_ids' not in data:
            return jsonify({
                'success': False,
                'error': 'role_id and permission_ids are required'
            }), 400
        
        if not isinstance(data['permission_ids'], list):
            return jsonify({
                'success': False,
                'error': 'permission_ids must be an array'
            }), 400
        
        assignments = RolePermission.assign_multiple_permissions(
            role_id=data['role_id'],
            permission_ids=data['permission_ids'],
            assigned_by=data.get('assigned_by')
        )
        
        return jsonify({
            'success': True,
            'message': f'Assigned {len(assignments)} permissions successfully',
            'data': [assignment.to_dict() for assignment in assignments]
        }), 201
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@role_permissions_bp.route('/replace', methods=['POST'])
def replace_role_permissions():
    """
    Replace all permissions for a role with a new set.
    Required: role_id, permission_ids (array)
    Optional: assigned_by
    """
    try:
        data = request.get_json()
        
        if not data or 'role_id' not in data or 'permission_ids' not in data:
            return jsonify({
                'success': False,
                'error': 'role_id and permission_ids are required'
            }), 400
        
        if not isinstance(data['permission_ids'], list):
            return jsonify({
                'success': False,
                'error': 'permission_ids must be an array'
            }), 400
        
        assignments = RolePermission.replace_role_permissions(
            role_id=data['role_id'],
            permission_ids=data['permission_ids'],
            assigned_by=data.get('assigned_by')
        )
        
        return jsonify({
            'success': True,
            'message': f'Replaced permissions successfully ({len(assignments)} permissions)',
            'data': [assignment.to_dict() for assignment in assignments]
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@role_permissions_bp.route('/revoke', methods=['POST'])
def revoke_permission():
    """
    Revoke a permission from a role.
    Required: role_id, permission_id
    """
    try:
        data = request.get_json()
        
        if not data or 'role_id' not in data or 'permission_id' not in data:
            return jsonify({
                'success': False,
                'error': 'role_id and permission_id are required'
            }), 400
        
        revoked = RolePermission.revoke_permission(
            role_id=data['role_id'],
            permission_id=data['permission_id']
        )
        
        if not revoked:
            return jsonify({
                'success': False,
                'error': 'Permission assignment not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Permission revoked successfully'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
