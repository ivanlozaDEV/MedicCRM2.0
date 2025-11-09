"""
User routes for DoctorCRM API.
Handles CRUD operations for users and authentication.
"""
from flask import Blueprint, request, jsonify
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

users_bp = Blueprint('users', __name__, url_prefix='/api/users')


@users_bp.route('', methods=['GET'])
def get_all_users():
    """
    Get all users.
    Query params: organization_id, active_only, medical_only
    """
    try:
        organization_id = request.args.get('organization_id', type=int)
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        medical_only = request.args.get('medical_only', 'false').lower() == 'true'
        include_specialties = request.args.get('include_specialties', 'false').lower() == 'true'
        
        query = User.query
        
        if organization_id:
            query = query.filter_by(organization_id=organization_id)
        
        if active_only:
            query = query.filter_by(is_active=True)
        
        users = query.all()
        
        # Filter medical professionals if requested
        if medical_only:
            users = [u for u in users if u.is_medical_professional]
        
        return jsonify({
            'success': True,
            'data': [user.to_dict(include_specialties=include_specialties) for user in users],
            'count': len(users)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get a single user by ID"""
    try:
        include_specialties = request.args.get('include_specialties', 'false').lower() == 'true'
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': user.to_dict(include_specialties=include_specialties)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@users_bp.route('', methods=['POST'])
def create_user():
    """
    Create a new user.
    Required: organization_id, username, email, password, first_name, last_name
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['organization_id', 'username', 'email', 'password', 'first_name', 'last_name']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Check if username or email already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({
                'success': False,
                'error': 'Username already exists'
            }), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'success': False,
                'error': 'Email already exists'
            }), 400
        
        # Extract password and create user
        password = data.pop('password')
        user = User.create(password=password, **data)
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'data': user.to_dict()
        }), 201
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@users_bp.route('/<int:user_id>', methods=['PUT', 'PATCH'])
def update_user(user_id):
    """Update a user"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Handle password separately if provided
        if 'password' in data:
            password = data.pop('password')
            user.set_password(password)
        
        user.update(**data)
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'data': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@users_bp.route('/<int:user_id>/deactivate', methods=['POST'])
def deactivate_user(user_id):
    """Deactivate a user (soft delete)"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user.deactivate()
        
        return jsonify({
            'success': True,
            'message': 'User deactivated successfully',
            'data': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@users_bp.route('/<int:user_id>/activate', methods=['POST'])
def activate_user(user_id):
    """Activate a user"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user.activate()
        
        return jsonify({
            'success': True,
            'message': 'User activated successfully',
            'data': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@users_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user permanently"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user.delete()
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@users_bp.route('/<int:user_id>/password-reset', methods=['POST'])
def request_password_reset(user_id):
    """Request password reset token for a user"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        token = user.generate_reset_token()
        
        return jsonify({
            'success': True,
            'message': 'Password reset token generated',
            'data': {
                'reset_token': token,
                'expires_at': user.reset_token_expires.isoformat()
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@users_bp.route('/validate-username', methods=['POST'])
def validate_username():
    """Check if username is available"""
    try:
        data = request.get_json()
        username = data.get('username')
        
        if not username:
            return jsonify({
                'success': False,
                'error': 'Username is required'
            }), 400
        
        exists = User.query.filter_by(username=username).first() is not None
        
        return jsonify({
            'success': True,
            'available': not exists
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@users_bp.route('/validate-email', methods=['POST'])
def validate_email():
    """Check if email is available"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        exists = User.query.filter_by(email=email).first() is not None
        
        return jsonify({
            'success': True,
            'available': not exists
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
