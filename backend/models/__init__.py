from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models
from models.organization import Organization
from models.user import User
from models.subscription import Subscription
from models.role import Role
from models.permission import Permission
from models.specialty import Specialty
from models.role_permission import RolePermission
from models.user_specialty import UserSpecialty
from models.user_role import UserRole

__all__ = [
    'db',
    'Organization',
    'User',
    'Subscription',
    'Role',
    'Permission',
    'Specialty',
    'RolePermission',
    'UserSpecialty',
    'UserRole'
]

