"""
Routes package for DoctorCRM API.
Contains all blueprint routes organized by resource.
"""

from flask import Blueprint

# Import all route blueprints
from routes.organizations import organizations_bp
from routes.users import users_bp
from routes.subscriptions import subscriptions_bp
from routes.roles import roles_bp
from routes.permissions import permissions_bp
from routes.specialties import specialties_bp
from routes.role_permissions import role_permissions_bp
from routes.user_specialties import user_specialties_bp

__all__ = [
    'organizations_bp',
    'users_bp',
    'subscriptions_bp',
    'roles_bp',
    'permissions_bp',
    'specialties_bp',
    'role_permissions_bp',
    'user_specialties_bp'
]
