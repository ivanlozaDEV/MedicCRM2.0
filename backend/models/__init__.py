from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models
from models.organization import Organization
from models.user import User

__all__ = ['db', 'Organization', 'User']
