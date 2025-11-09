from datetime import datetime
from models import db


class RolePermission(db.Model):
    """
    RolePermission model for managing the many-to-many relationship between roles and permissions.
    This allows assigning multiple permissions to a role.
    """
    __tablename__ = 'role_permissions'
    
    # Composite Primary Key
    role_id = db.Column(
        db.Integer,
        db.ForeignKey('roles.id', ondelete='CASCADE'),
        primary_key=True
    )
    permission_id = db.Column(
        db.Integer,
        db.ForeignKey('permissions.id', ondelete='CASCADE'),
        primary_key=True
    )
    
    # Audit
    assigned_by = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='SET NULL')
    )
    assigned_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    role = db.relationship('Role', backref=db.backref('role_permissions', lazy='dynamic', cascade='all, delete-orphan'))
    permission = db.relationship('Permission', backref=db.backref('permission_roles', lazy='dynamic'))
    assigner = db.relationship('User', foreign_keys=[assigned_by])
    
    def __repr__(self):
        return f'<RolePermission role_id={self.role_id} permission_id={self.permission_id}>'
    
    def to_dict(self):
        """
        Convert model to dictionary for JSON serialization.
        
        Returns:
            dict: RolePermission data as dictionary
        """
        return {
            'role_id': self.role_id,
            'permission_id': self.permission_id,
            'assigned_by': self.assigned_by,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None
        }
    
    @classmethod
    def assign_permission(cls, role_id, permission_id, assigned_by=None):
        """
        Assign a permission to a role.
        
        Args:
            role_id (int): Role ID
            permission_id (int): Permission ID
            assigned_by (int, optional): User ID who assigned the permission
            
        Returns:
            RolePermission: Created role-permission assignment
        """
        # Check if assignment already exists
        existing = cls.query.filter_by(
            role_id=role_id,
            permission_id=permission_id
        ).first()
        
        if existing:
            return existing
        
        assignment = cls(
            role_id=role_id,
            permission_id=permission_id,
            assigned_by=assigned_by
        )
        db.session.add(assignment)
        db.session.commit()
        return assignment
    
    @classmethod
    def revoke_permission(cls, role_id, permission_id):
        """
        Revoke a permission from a role.
        
        Args:
            role_id (int): Role ID
            permission_id (int): Permission ID
            
        Returns:
            bool: True if revoked, False if assignment didn't exist
        """
        assignment = cls.query.filter_by(
            role_id=role_id,
            permission_id=permission_id
        ).first()
        
        if assignment:
            db.session.delete(assignment)
            db.session.commit()
            return True
        
        return False
    
    @staticmethod
    def get_role_permissions(role_id):
        """
        Get all permissions assigned to a role.
        
        Args:
            role_id (int): Role ID
            
        Returns:
            list: List of Permission instances
        """
        from models.permission import Permission
        
        assignments = RolePermission.query.filter_by(role_id=role_id).all()
        permission_ids = [a.permission_id for a in assignments]
        
        return Permission.query.filter(Permission.id.in_(permission_ids)).all()
    
    @staticmethod
    def get_permission_roles(permission_id):
        """
        Get all roles that have a specific permission.
        
        Args:
            permission_id (int): Permission ID
            
        Returns:
            list: List of Role instances
        """
        from models.role import Role
        
        assignments = RolePermission.query.filter_by(permission_id=permission_id).all()
        role_ids = [a.role_id for a in assignments]
        
        return Role.query.filter(Role.id.in_(role_ids)).all()
    
    @classmethod
    def assign_multiple_permissions(cls, role_id, permission_ids, assigned_by=None):
        """
        Assign multiple permissions to a role at once.
        
        Args:
            role_id (int): Role ID
            permission_ids (list): List of permission IDs
            assigned_by (int, optional): User ID who assigned the permissions
            
        Returns:
            list: List of created RolePermission instances
        """
        assignments = []
        for permission_id in permission_ids:
            assignment = cls.assign_permission(role_id, permission_id, assigned_by)
            assignments.append(assignment)
        
        return assignments
    
    @classmethod
    def replace_role_permissions(cls, role_id, permission_ids, assigned_by=None):
        """
        Replace all permissions for a role with a new set.
        
        Args:
            role_id (int): Role ID
            permission_ids (list): List of permission IDs
            assigned_by (int, optional): User ID who is making the change
            
        Returns:
            list: List of new RolePermission instances
        """
        # Remove all existing permissions for this role
        cls.query.filter_by(role_id=role_id).delete()
        
        # Add new permissions
        return cls.assign_multiple_permissions(role_id, permission_ids, assigned_by)
