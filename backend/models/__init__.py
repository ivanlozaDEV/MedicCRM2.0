from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models
from models.organization import Organization
from models.user import User
from models.subscription import Subscription
from models.role import Role
from models.permission import Permission

__all__ = ['db', 'Organization', 'User', 'Subscription', 'Role', 'Permission']
