from datetime import datetime
from models import db


class UserRole(db.Model):
    """
    UserRole model for managing the many-to-many relationship between users and roles.
    This allows users to have multiple roles within their organization.
    """
    __tablename__ = 'user_roles'
    
    # Composite Primary Key
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        primary_key=True
    )
    role_id = db.Column(
        db.Integer,
        db.ForeignKey('roles.id', ondelete='CASCADE'),
        primary_key=True
    )
    
    # Additional Information
    is_primary = db.Column(db.Boolean, default=False)
    # Indicates if this is the user's primary/main role
    
    # Audit
    assigned_by = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='SET NULL')
    )
    assigned_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('user_roles', lazy='dynamic', cascade='all, delete-orphan'))
    role = db.relationship('Role', backref=db.backref('role_users', lazy='dynamic'))
    assigner = db.relationship('User', foreign_keys=[assigned_by])
    
    def __repr__(self):
        return f'<UserRole user_id={self.user_id} role_id={self.role_id}>'
    
    def to_dict(self):
        """
        Convert model to dictionary for JSON serialization.
        
        Returns:
            dict: UserRole data as dictionary
        """
        return {
            'user_id': self.user_id,
            'role_id': self.role_id,
            'is_primary': self.is_primary,
            'assigned_by': self.assigned_by,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
            'role': self.role.to_dict() if self.role else None
        }
    
    def to_dict_simple(self):
        """
        Convert model to simplified dictionary (without relationships).
        
        Returns:
            dict: Simplified UserRole data as dictionary
        """
        return {
            'user_id': self.user_id,
            'role_id': self.role_id,
            'is_primary': self.is_primary,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
        }
