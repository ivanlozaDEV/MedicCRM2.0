"""
Authentication Routes
Handles login, signup, logout, and current user endpoints
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db
from models.user import User
from models.organization import Organization
from models.role import Role
from datetime import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/test', methods=['GET'])
def test():
    """Test endpoint to verify auth routes are working"""
    return jsonify({
        'success': True,
        'message': 'Auth routes are working!'
    }), 200

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Register new user with organization
    Creates organization and admin user in one transaction
    """
    try:
        data = request.get_json()
        print(f"📥 Signup request data: {data}")
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name', 'organization_name']
        for field in required_fields:
            if not data.get(field):
                print(f"❌ Missing field: {field}")
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'success': False,
                'message': 'Email already registered'
            }), 400
        
        # Create organization
        organization = Organization(
            name=data['organization_name'],
            is_active=True
        )
        db.session.add(organization)
        db.session.flush()  # Get organization ID
        
        # Create username from email
        username = data['email'].split('@')[0]
        base_username = username
        counter = 1
        while User.query.filter_by(username=username).first():
            username = f"{base_username}{counter}"
            counter += 1
        
        # Create user
        user = User(
            organization_id=organization.id,
            username=username,
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            first_name=data['first_name'],
            last_name=data['last_name'],
            is_active=True
        )
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        # Create or get Admin role
        admin_role = Role.query.filter_by(
            organization_id=organization.id,
            name='Admin'
        ).first()
        
        if not admin_role:
            admin_role = Role(
                organization_id=organization.id,
                name='Admin',
                description='Administrador con todos los permisos',
                color='#3B82F6',
                is_system=True,
                created_by=user.id
            )
            db.session.add(admin_role)
            db.session.flush()
        
        # Assign admin role to user (we'll implement this later when we add user_roles table)
        # For now, the user is created successfully
        
        db.session.commit()
        
        # Create JWT token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'data': {
                'user': user.to_dict(),
                'organization': organization.to_dict(),
                'token': access_token
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"❌ Signup error: {e}")
        print(f"📋 Traceback:")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Registration failed: {str(e)}'
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user with email and password
    Returns user data and JWT token
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email and password are required'
            }), 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
        
        if not user.is_active:
            return jsonify({
                'success': False,
                'message': 'Account is inactive'
            }), 403
        
        # Get organization
        organization = Organization.query.get(user.organization_id)
        
        if not organization or not organization.is_active:
            return jsonify({
                'success': False,
                'message': 'Organization is inactive'
            }), 403
        
        # Create JWT token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': user.to_dict(),
                'organization': organization.to_dict(),
                'token': access_token
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({
            'success': False,
            'message': f'Login failed: {str(e)}'
        }), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current authenticated user with permissions and roles
    """
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Get organization
        organization = Organization.query.get(user.organization_id)
        
        # Get user's roles (placeholder until we implement user_roles table)
        roles = []
        
        # Get user's permissions (placeholder)
        permissions = []
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict(),
                'organization': organization.to_dict() if organization else None,
                'roles': roles,
                'permissions': permissions
            }
        }), 200
        
    except Exception as e:
        print(f"Get current user error: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to get user: {str(e)}'
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user (currently just a placeholder since we use client-side token removal)
    """
    return jsonify({
        'success': True,
        'message': 'Logout successful'
    }), 200
