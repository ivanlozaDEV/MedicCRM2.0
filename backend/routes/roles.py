"""
Role routes for DoctorCRM API.
Handles CRUD operations for roles (system and custom).
"""
from flask import Blueprint, request, jsonify
from models import db, Role
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
