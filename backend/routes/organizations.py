"""
Organization routes for DoctorCRM API.
Handles CRUD operations for organizations.
"""
from flask import Blueprint, request, jsonify
from models import db, Organization
from datetime import datetime

organizations_bp = Blueprint('organizations', __name__, url_prefix='/api/organizations')


@organizations_bp.route('', methods=['GET'])
def get_all_organizations():
    """
    Get all organizations.
    Query params: active_only (bool)
    """
    try:
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        
        organizations = Organization.get_all(active_only=active_only)
        
        return jsonify({
            'success': True,
            'data': [org.to_dict() for org in organizations],
            'count': len(organizations)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@organizations_bp.route('/<int:org_id>', methods=['GET'])
def get_organization(org_id):
    """Get a single organization by ID"""
    try:
        organization = Organization.query.get(org_id)
        
        if not organization:
            return jsonify({
                'success': False,
                'error': 'Organization not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': organization.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@organizations_bp.route('', methods=['POST'])
def create_organization():
    """
    Create a new organization.
    Required: name
    Optional: description, logo_url, primary_color, etc.
    """
    try:
        data = request.get_json()
        
        if not data or 'name' not in data:
            return jsonify({
                'success': False,
                'error': 'Organization name is required'
            }), 400
        
        organization = Organization.create(**data)
        
        return jsonify({
            'success': True,
            'message': 'Organization created successfully',
            'data': organization.to_dict()
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


@organizations_bp.route('/<int:org_id>', methods=['PUT', 'PATCH'])
def update_organization(org_id):
    """Update an organization"""
    try:
        organization = Organization.query.get(org_id)
        
        if not organization:
            return jsonify({
                'success': False,
                'error': 'Organization not found'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        organization.update(**data)
        
        return jsonify({
            'success': True,
            'message': 'Organization updated successfully',
            'data': organization.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@organizations_bp.route('/<int:org_id>/deactivate', methods=['POST'])
def deactivate_organization(org_id):
    """Deactivate an organization (soft delete)"""
    try:
        organization = Organization.query.get(org_id)
        
        if not organization:
            return jsonify({
                'success': False,
                'error': 'Organization not found'
            }), 404
        
        organization.deactivate()
        
        return jsonify({
            'success': True,
            'message': 'Organization deactivated successfully',
            'data': organization.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@organizations_bp.route('/<int:org_id>/activate', methods=['POST'])
def activate_organization(org_id):
    """Activate an organization"""
    try:
        organization = Organization.query.get(org_id)
        
        if not organization:
            return jsonify({
                'success': False,
                'error': 'Organization not found'
            }), 404
        
        organization.activate()
        
        return jsonify({
            'success': True,
            'message': 'Organization activated successfully',
            'data': organization.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@organizations_bp.route('/<int:org_id>', methods=['DELETE'])
def delete_organization(org_id):
    """Delete an organization permanently"""
    try:
        organization = Organization.query.get(org_id)
        
        if not organization:
            return jsonify({
                'success': False,
                'error': 'Organization not found'
            }), 404
        
        organization.delete()
        
        return jsonify({
            'success': True,
            'message': 'Organization deleted successfully'
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


@organizations_bp.route('/<int:org_id>/stats', methods=['GET'])
def get_organization_stats(org_id):
    """Get organization statistics"""
    try:
        organization = Organization.query.get(org_id)
        
        if not organization:
            return jsonify({
                'success': False,
                'error': 'Organization not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'organization': organization.to_dict(),
                'user_count': organization.user_count,
                'active_subscription': organization.subscription.to_dict() if organization.subscription else None
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
