from datetime import datetime
from models import db


class Role(db.Model):
    """
    Role model for managing user permissions and access control.
    Each organization can have multiple roles with different permissions.
    """
    __tablename__ = 'roles'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    organization_id = db.Column(
        db.Integer,
        db.ForeignKey('organizations.id', ondelete='CASCADE'),
        nullable=False
    )
    
    # Role Information
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7), default='#6B7280')
    
    # Role Type
    is_system = db.Column(db.Boolean, nullable=False, default=False)
    # true = System role created automatically (e.g., initial Admin)
    # false = Custom role created by user
    
    # Audit
    created_by = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='SET NULL')
    )
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = db.relationship('Organization', backref=db.backref('roles', lazy='dynamic'))
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_roles')
    
    # Unique constraint
    __table_args__ = (
        db.UniqueConstraint('organization_id', 'name', name='uq_org_role_name'),
    )
    
    # System role constants
    ROLE_ADMIN = 'Admin'
    ROLE_DOCTOR = 'Doctor'
    ROLE_NURSE = 'Nurse'
    ROLE_RECEPTIONIST = 'Receptionist'
    ROLE_ACCOUNTANT = 'Accountant'
    
    SYSTEM_ROLES = [ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_RECEPTIONIST, ROLE_ACCOUNTANT]
    
    def __repr__(self):
        return f'<Role {self.name} (org={self.organization_id})>'
    
    @property
    def is_admin(self):
        """Check if this is an admin role"""
        return self.name == self.ROLE_ADMIN
    
    @property
    def user_count(self):
        """Get count of users with this role"""
        # This will be implemented when UserRole model is created
        # For now, return 0
        return 0
    
    def to_dict(self, include_users=False):
        """
        Convert model to dictionary for JSON serialization.
        
        Args:
            include_users (bool): Include list of users with this role
            
        Returns:
            dict: Role data as dictionary
        """
        data = {
            'id': self.id,
            'organization_id': self.organization_id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'is_system': self.is_system,
            'is_admin': self.is_admin,
            'user_count': self.user_count,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_users:
            # This will be implemented when UserRole model is created
            data['users'] = []
        
        return data
    
    @classmethod
    def create(cls, organization_id, name, created_by=None, **kwargs):
        """
        Create a new role.
        
        Args:
            organization_id (int): Organization ID
            name (str): Role name
            created_by (int, optional): User ID who created the role
            **kwargs: Additional role attributes
            
        Returns:
            Role: Created role instance
        """
        role = cls(
            organization_id=organization_id,
            name=name,
            created_by=created_by,
            **kwargs
        )
        db.session.add(role)
        db.session.commit()
        return role
    
    def update(self, **kwargs):
        """
        Update role attributes.
        System roles cannot be renamed.
        
        Args:
            **kwargs: Attributes to update
            
        Returns:
            Role: Updated role instance
        """
        # Prevent renaming system roles
        if self.is_system and 'name' in kwargs and kwargs['name'] != self.name:
            raise ValueError("Cannot rename system roles")
        
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def delete(self):
        """
        Delete role.
        System roles cannot be deleted.
        
        Returns:
            bool: True if deleted, False if system role
        """
        if self.is_system:
            raise ValueError("Cannot delete system roles")
        
        if self.user_count > 0:
            raise ValueError("Cannot delete role with assigned users")
        
        db.session.delete(self)
        db.session.commit()
        return True
    
    @staticmethod
    def create_system_roles(organization_id):
        """
        Create default system roles for a new organization.
        
        Args:
            organization_id (int): Organization ID
            
        Returns:
            list: List of created system roles
        """
        system_roles_config = [
            {
                'name': Role.ROLE_ADMIN,
                'description': 'Full system access with all permissions',
                'color': '#DC2626'  # Red
            },
            {
                'name': Role.ROLE_DOCTOR,
                'description': 'Medical professionals with patient care access',
                'color': '#2563EB'  # Blue
            },
            {
                'name': Role.ROLE_NURSE,
                'description': 'Nursing staff with patient support access',
                'color': '#059669'  # Green
            },
            {
                'name': Role.ROLE_RECEPTIONIST,
                'description': 'Front desk staff with scheduling and basic patient info access',
                'color': '#7C3AED'  # Purple
            },
            {
                'name': Role.ROLE_ACCOUNTANT,
                'description': 'Financial staff with billing and payment access',
                'color': '#EA580C'  # Orange
            }
        ]
        
        created_roles = []
        for role_config in system_roles_config:
            # Check if role already exists
            existing = Role.query.filter_by(
                organization_id=organization_id,
                name=role_config['name']
            ).first()
            
            if not existing:
                role = Role.create(
                    organization_id=organization_id,
                    is_system=True,
                    **role_config
                )
                created_roles.append(role)
            else:
                created_roles.append(existing)
        
        return created_roles
    
    @staticmethod
    def find_by_name(organization_id, name):
        """
        Find role by name within an organization.
        
        Args:
            organization_id (int): Organization ID
            name (str): Role name
            
        Returns:
            Role: Role instance or None
        """
        return Role.query.filter_by(
            organization_id=organization_id,
            name=name
        ).first()
    
    @staticmethod
    def find_by_organization(organization_id, system_only=False, custom_only=False):
        """
        Find all roles in an organization.
        
        Args:
            organization_id (int): Organization ID
            system_only (bool): Return only system roles
            custom_only (bool): Return only custom roles
            
        Returns:
            list: List of Role instances
        """
        query = Role.query.filter_by(organization_id=organization_id)
        
        if system_only:
            query = query.filter_by(is_system=True)
        elif custom_only:
            query = query.filter_by(is_system=False)
        
        return query.order_by(Role.name).all()
    
    @staticmethod
    def get_admin_role(organization_id):
        """
        Get the admin role for an organization.
        
        Args:
            organization_id (int): Organization ID
            
        Returns:
            Role: Admin role instance or None
        """
        return Role.find_by_name(organization_id, Role.ROLE_ADMIN)
    
    @staticmethod
    def validate_role_name(organization_id, name, exclude_id=None):
        """
        Validate if role name is unique within organization.
        
        Args:
            organization_id (int): Organization ID
            name (str): Role name to validate
            exclude_id (int, optional): Role ID to exclude from check (for updates)
            
        Returns:
            bool: True if valid, False if name already exists
        """
        query = Role.query.filter_by(
            organization_id=organization_id,
            name=name
        )
        
        if exclude_id:
            query = query.filter(Role.id != exclude_id)
        
        return query.first() is None
