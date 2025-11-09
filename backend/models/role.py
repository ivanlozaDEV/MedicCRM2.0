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
    # True = System role (predefined/suggested, cannot be deleted or renamed)
    #        Examples: Admin, Doctor, Nurse, Receptionist, Accountant
    # False = Custom role (admin-created, can be modified and deleted)
    #         Examples: Lab Technician, Pharmacist, Medical Assistant, etc.
    
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
    
    # System role constants (suggested/default roles)
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
        from models.user_role import UserRole
        return UserRole.query.filter_by(role_id=self.id).count()
    
    @property
    def permission_count(self):
        """Get count of permissions assigned to this role"""
        from models.role_permission import RolePermission
        return RolePermission.query.filter_by(role_id=self.id).count()
    
    def to_dict(self, include_users=False, include_permissions=False):
        """
        Convert model to dictionary for JSON serialization.
        
        Args:
            include_users (bool): Include list of users with this role
            include_permissions (bool): Include count of permissions
            
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
            'permission_count': self.permission_count,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_users:
            from models.user_role import UserRole
            user_roles = UserRole.query.filter_by(role_id=self.id).all()
            data['users'] = [ur.to_dict() for ur in user_roles]
        
        if include_permissions:
            from models.role_permission import RolePermission
            from models.permission import Permission
            role_perms = RolePermission.query.filter_by(role_id=self.id).all()
            perm_ids = [rp.permission_id for rp in role_perms]
            permissions = Permission.query.filter(Permission.id.in_(perm_ids)).all() if perm_ids else []
            data['permissions'] = [p.to_dict() for p in permissions]
        
        return data
    
    @classmethod
    def create(cls, organization_id, name, created_by=None, is_system=False, **kwargs):
        """
        Create a new role.
        Use is_system=True only for predefined system roles.
        Admin-created custom roles should use is_system=False (default).
        
        Args:
            organization_id (int): Organization ID
            name (str): Role name
            created_by (int, optional): User ID who created the role
            is_system (bool): True for system roles, False for custom roles
            **kwargs: Additional role attributes (description, color, etc.)
            
        Returns:
            Role: Created role instance
            
        Raises:
            ValueError: If role name already exists in organization
        """
        # Validate unique name
        if not cls.validate_role_name(organization_id, name):
            raise ValueError(f"Role name '{name}' already exists in this organization")
        
        role = cls(
            organization_id=organization_id,
            name=name,
            created_by=created_by,
            is_system=is_system,
            **kwargs
        )
        db.session.add(role)
        db.session.commit()
        return role
    
    def update(self, **kwargs):
        """
        Update role attributes.
        System roles cannot be renamed or have their is_system flag changed.
        Custom roles created by admins can be freely modified.
        
        Args:
            **kwargs: Attributes to update
            
        Returns:
            Role: Updated role instance
            
        Raises:
            ValueError: If trying to rename a system role or modify is_system flag
        """
        # Prevent renaming system roles
        if self.is_system and 'name' in kwargs and kwargs['name'] != self.name:
            raise ValueError("Cannot rename system roles. System roles are predefined.")
        
        # Prevent changing is_system flag
        if 'is_system' in kwargs and kwargs['is_system'] != self.is_system:
            raise ValueError("Cannot change role type (system/custom)")
        
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def delete(self):
        """
        Delete role.
        System roles (predefined) cannot be deleted.
        Custom roles created by admins can be deleted if they have no assigned users.
        
        Returns:
            bool: True if deleted
            
        Raises:
            ValueError: If role is a system role or has assigned users
        """
        if self.is_system:
            raise ValueError("Cannot delete system roles. System roles are predefined and protected.")
        
        if self.user_count > 0:
            raise ValueError(f"Cannot delete role with {self.user_count} assigned users. Remove users first.")
        
        db.session.delete(self)
        db.session.commit()
        return True
    
    @staticmethod
    def create_system_roles(organization_id):
        """
        Create default system roles for a new organization.
        These are suggested/predefined roles that come with the system.
        Admins can also create additional custom roles with is_system=False.
        
        System roles (is_system=True):
        - Cannot be deleted
        - Cannot be renamed
        - Serve as templates/suggestions
        
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
            system_only (bool): Return only system roles (predefined)
            custom_only (bool): Return only custom roles (admin-created)
            
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
    def create_custom_role(organization_id, name, created_by, description=None, color='#6B7280'):
        """
        Helper method to create a custom role (admin-created).
        Custom roles have is_system=False and can be freely modified/deleted.
        
        Args:
            organization_id (int): Organization ID
            name (str): Custom role name
            created_by (int): User ID who is creating the role
            description (str, optional): Role description
            color (str): Hex color for the role (default: gray)
            
        Returns:
            Role: Created custom role instance
            
        Example:
            custom_role = Role.create_custom_role(
                organization_id=1,
                name='Lab Technician',
                created_by=admin_user_id,
                description='Laboratory staff with test result access',
                color='#10B981'
            )
        """
        return Role.create(
            organization_id=organization_id,
            name=name,
            created_by=created_by,
            description=description,
            color=color,
            is_system=False  # Explicitly set as custom role
        )
    
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
