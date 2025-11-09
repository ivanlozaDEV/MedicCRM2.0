"""
Role routes for DoctorCRM API.
Handles CRUD operations for roles (system and custom).
Includes role-permission assignment endpoints.
"""
from flask import Blueprint, request, jsonify
from models import db, Role, Permission, RolePermission
from datetime import datetime

roles_bp = Blueprint('roles', __name__, url_prefix='/api/roles')


@roles_bp.route('', methods=['GET'])
def get_all_roles():
    """
    Get all roles.
    Query params: organization_id, system_only, custom_only
    """
    try:
        organization_id = request.args.get('organization_id', type=int)
        system_only = request.args.get('system_only', 'false').lower() == 'true'
        custom_only = request.args.get('custom_only', 'false').lower() == 'true'
        
        if not organization_id:
            return jsonify({
                'success': False,
                'error': 'organization_id is required'
            }), 400
        
        roles = Role.find_by_organization(
            organization_id,
            system_only=system_only,
            custom_only=custom_only
        )
        
        return jsonify({
            'success': True,
            'data': [role.to_dict() for role in roles],
            'count': len(roles)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@roles_bp.route('/<int:role_id>', methods=['GET'])
def get_role(role_id):
    """Get a single role by ID"""
    try:
        role = Role.query.get(role_id)
        
        if not role:
            return jsonify({
                'success': False,
                'error': 'Role not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': role.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@roles_bp.route('', methods=['POST'])
def create_role():
    """
    Create a new custom role.
    Required: organization_id, name
    """
    try:
        data = request.get_json()
        
        if not data or 'organization_id' not in data or 'name' not in data:
            return jsonify({
                'success': False,
                'error': 'organization_id and name are required'
            }), 400
        
        # Use create_custom_role for explicit custom role creation
        role = Role.create_custom_role(
            organization_id=data['organization_id'],
            name=data['name'],
            created_by=data.get('created_by'),
            description=data.get('description'),
            color=data.get('color', '#6B7280')
        )
        
        return jsonify({
            'success': True,
            'message': 'Role created successfully',
            'data': role.to_dict()
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


@roles_bp.route('/<int:role_id>', methods=['PUT', 'PATCH'])
def update_role(role_id):
    """Update a role (system roles cannot be renamed)"""
    try:
        role = Role.query.get(role_id)
        
        if not role:
            return jsonify({
                'success': False,
                'error': 'Role not found'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        role.update(**data)
        
        return jsonify({
            'success': True,
            'message': 'Role updated successfully',
            'data': role.to_dict()
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


@roles_bp.route('/<int:role_id>', methods=['DELETE'])
def delete_role(role_id):
    """Delete a role (system roles cannot be deleted)"""
    try:
        role = Role.query.get(role_id)
        
        if not role:
            return jsonify({
                'success': False,
                'error': 'Role not found'
            }), 404
        
        role.delete()
        
        return jsonify({
            'success': True,
            'message': 'Role deleted successfully'
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


@roles_bp.route('/organization/<int:org_id>/init-system-roles', methods=['POST'])
def initialize_system_roles(org_id):
    """Create default system roles for an organization"""
    try:
        roles = Role.create_system_roles(org_id)
        
        return jsonify({
            'success': True,
            'message': f'Created {len(roles)} system roles',
            'data': [role.to_dict() for role in roles]
        }), 201
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============ ROLE PERMISSIONS ENDPOINTS ============

@roles_bp.route('/<int:role_id>/permissions', methods=['GET'])
def get_role_permissions(role_id):
    """
    Get all permissions assigned to a role.
    Returns the full permission details, not just IDs.
    """
    try:
        role = Role.query.get(role_id)
        
        if not role:
            return jsonify({
                'success': False,
                'error': 'Role not found'
            }), 404
        
        # Get all RolePermission records for this role
        role_permissions = RolePermission.query.filter_by(role_id=role_id).all()
        permission_ids = [rp.permission_id for rp in role_permissions]
        
        # Get the full permission details
        permissions = Permission.query.filter(Permission.id.in_(permission_ids)).all() if permission_ids else []
        
        return jsonify({
            'success': True,
            'data': {
                'role': role.to_dict(),
                'permissions': [p.to_dict() for p in permissions],
                'count': len(permissions)
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@roles_bp.route('/<int:role_id>/permissions', methods=['PUT'])
def update_role_permissions(role_id):
    """
    Update permissions for a role.
    Replaces all existing permissions with the new list.
    
    Body: {
        "permission_ids": [1, 2, 3, ...]
    }
    """
    try:
        role = Role.query.get(role_id)
        
        if not role:
            return jsonify({
                'success': False,
                'error': 'Role not found'
            }), 404
        
        data = request.get_json()
        
        if not data or 'permission_ids' not in data:
            return jsonify({
                'success': False,
                'error': 'permission_ids is required'
            }), 400
        
        permission_ids = data['permission_ids']
        
        if not isinstance(permission_ids, list):
            return jsonify({
                'success': False,
                'error': 'permission_ids must be an array'
            }), 400
        
        # Verify all permissions exist
        if permission_ids:
            existing_permissions = Permission.query.filter(Permission.id.in_(permission_ids)).all()
            if len(existing_permissions) != len(permission_ids):
                return jsonify({
                    'success': False,
                    'error': 'Some permissions do not exist'
                }), 400
        
        # Delete existing role permissions
        RolePermission.query.filter_by(role_id=role_id).delete()
        
        # Create new role permissions
        for permission_id in permission_ids:
            role_permission = RolePermission(
                role_id=role_id,
                permission_id=permission_id
            )
            db.session.add(role_permission)
        
        db.session.commit()
        
        # Get updated permissions
        permissions = Permission.query.filter(Permission.id.in_(permission_ids)).all() if permission_ids else []
        
        return jsonify({
            'success': True,
            'message': f'Updated permissions for role {role.name}',
            'data': {
                'role': role.to_dict(),
                'permissions': [p.to_dict() for p in permissions],
                'count': len(permissions)
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

