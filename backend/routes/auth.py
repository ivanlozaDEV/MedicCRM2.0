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
from models.user_role import UserRole
from models.role_permission import RolePermission
from models.permission import Permission
from models.subscription import Subscription
from seed_default_roles import seed_default_roles_for_organization
from datetime import datetime, timedelta

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
        
        # Generate unique slug for organization
        import re
        base_slug = re.sub(r'[^a-z0-9]+', '-', data['organization_name'].lower()).strip('-')
        slug = base_slug
        counter = 1
        while Organization.query.filter_by(slug=slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Create organization
        organization = Organization(
            name=data['organization_name'],
            slug=slug,
            is_active=True
        )
        db.session.add(organization)
        db.session.flush()  # Get organization ID
        
        print(f"✅ Created organization: {organization.name} (/{organization.slug})")
        
        # Seed default roles with permissions for this organization
        try:
            seed_default_roles_for_organization(organization.id)
            print(f"✅ Seeded default roles for organization {organization.id}")
        except Exception as role_error:
            print(f"⚠️  Warning: Could not seed default roles: {role_error}")
            # Continue anyway - organization is created
        
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
        
        # Get Administrador role (created by seed_default_roles)
        admin_role = Role.query.filter_by(
            organization_id=organization.id,
            name='Administrador'
        ).first()
        
        if not admin_role:
            # Fallback: create basic admin role if seed failed
            print("⚠️  Admin role not found, creating fallback...")
            admin_role = Role(
                organization_id=organization.id,
                name='Administrador',
                description='Administrador con todos los permisos',
                color='#6366F1',
                is_system=True,
                created_by=user.id
            )
            db.session.add(admin_role)
            db.session.flush()
        
        # Assign admin role to user
        user_role = UserRole(
            user_id=user.id,
            role_id=admin_role.id,
            is_primary=True,
            assigned_by=user.id
        )
        db.session.add(user_role)
        
        # Create trial subscription (15 days)
        trial_end = datetime.utcnow() + timedelta(days=15)
        subscription = Subscription.create(
            organization_id=organization.id,
            plan_name='trial',
            status='trial',
            trial_end_date=trial_end,
            current_period_start=datetime.utcnow(),
            current_period_end=trial_end
        )
        print(f"✅ Created trial subscription for organization {organization.id} - expires {trial_end}")
        
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
    Get current authenticated user with permissions, roles, and specialties
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
        
        # Get user's roles from user_roles table with full permission details
        user_role_records = UserRole.query.filter_by(user_id=user.id).all()
        roles = []
        for ur in user_role_records:
            if ur.role:
                role_dict = ur.role.to_dict()
                role_dict['is_primary'] = ur.is_primary
                role_dict['assigned_at'] = ur.assigned_at.isoformat() if ur.assigned_at else None
                
                # Get permissions for this role with full details
                role_permissions = RolePermission.query.filter_by(role_id=ur.role_id).all()
                role_permissions_list = []
                for rp in role_permissions:
                    if rp.permission:
                        role_permissions_list.append({
                            'id': rp.permission.id,
                            'name': rp.permission.module_key,
                            'description': rp.permission.description,
                            'display_name': rp.permission.display_name,
                            'category': rp.permission.category
                        })
                role_dict['permissions'] = role_permissions_list
                roles.append(role_dict)
        
        # Get user's permissions from their roles (for backward compatibility)
        permissions = []
        permission_ids = set()  # To avoid duplicates
        
        for ur in user_role_records:
            role_permissions = RolePermission.query.filter_by(role_id=ur.role_id).all()
            for rp in role_permissions:
                if rp.permission and rp.permission_id not in permission_ids:
                    permissions.append(rp.permission.module_key)
                    permission_ids.add(rp.permission_id)
        
        # Get user dict with specialties
        user_dict = user.to_dict(include_specialties=True)
        
        return jsonify({
            'success': True,
            'data': {
                'user': user_dict,
                'organization': organization.to_dict() if organization else None,
                'roles': roles,
                'permissions': permissions
            }
        }), 200
        
    except Exception as e:
        print(f"Get current user error: {e}")
        import traceback
        traceback.print_exc()
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
