from datetime import datetime
from models import db


class Permission(db.Model):
    """
    Permission model for defining system-wide permissions.
    Permissions are assigned to roles via RolePermission to control access to different modules.
    Permissions are managed by administrators and can be dynamically created.
    """
    __tablename__ = 'permissions'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Module Identifier
    module_key = db.Column(db.String(50), unique=True, nullable=False)
    display_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)
    # Categories: 'clinical', 'administrative', 'system'
    
    # Timestamp
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Category constants
    CATEGORY_CLINICAL = 'clinical'
    CATEGORY_ADMINISTRATIVE = 'administrative'
    CATEGORY_SYSTEM = 'system'
    
    CATEGORIES = [CATEGORY_CLINICAL, CATEGORY_ADMINISTRATIVE, CATEGORY_SYSTEM]
    
    def __repr__(self):
        return f'<Permission {self.module_key}>'
    
    def to_dict(self):
        """
        Convert model to dictionary for JSON serialization.
        
        Returns:
            dict: Permission data as dictionary
        """
        return {
            'id': self.id,
            'module_key': self.module_key,
            'display_name': self.display_name,
            'description': self.description,
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def create(cls, module_key, display_name, category, description=None):
        """
        Create a new permission.
        
        Args:
            module_key (str): Unique module identifier (e.g., 'patients.view')
            display_name (str): Human-readable permission name
            category (str): Permission category (clinical/administrative/system)
            description (str, optional): Permission description
            
        Returns:
            Permission: Created permission instance
        """
        if category not in cls.CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(cls.CATEGORIES)}")
        
        # Check if permission already exists
        existing = cls.query.filter_by(module_key=module_key).first()
        if existing:
            return existing
        
        permission = cls(
            module_key=module_key,
            display_name=display_name,
            description=description,
            category=category
        )
        db.session.add(permission)
        db.session.commit()
        return permission
    
    def update(self, **kwargs):
        """
        Update permission attributes.
        
        Args:
            **kwargs: Attributes to update
            
        Returns:
            Permission: Updated permission instance
        """
        for key, value in kwargs.items():
            if hasattr(self, key) and key != 'id':
                setattr(self, key, value)
        
        db.session.commit()
        return self
    
    def delete(self):
        """
        Delete permission.
        Note: This will cascade delete all role-permission assignments.
        
        Returns:
            bool: True if deleted
        """
        db.session.delete(self)
        db.session.commit()
        return True
    
    @staticmethod
    def find_by_key(module_key):
        """
        Find permission by module key.
        
        Args:
            module_key (str): Module key to search for
            
        Returns:
            Permission: Permission instance or None
        """
        return Permission.query.filter_by(module_key=module_key).first()
    
    @staticmethod
    def find_by_category(category):
        """
        Find all permissions in a category.
        
        Args:
            category (str): Category to filter by
            
        Returns:
            list: List of Permission instances
        """
        return Permission.query.filter_by(category=category).order_by(Permission.module_key).all()
    
    @staticmethod
    def get_all():
        """
        Get all permissions.
        
        Returns:
            list: List of all Permission instances
        """
        return Permission.query.order_by(Permission.category, Permission.module_key).all()
    
    @staticmethod
    def get_all_grouped():
        """
        Get all permissions grouped by category.
        
        Returns:
            dict: Dictionary with categories as keys and permission lists as values
        """
        permissions = Permission.query.order_by(Permission.category, Permission.module_key).all()
        
        grouped = {
            Permission.CATEGORY_CLINICAL: [],
            Permission.CATEGORY_ADMINISTRATIVE: [],
            Permission.CATEGORY_SYSTEM: []
        }
        
        for perm in permissions:
            if perm.category in grouped:
                grouped[perm.category].append(perm.to_dict())
        
        return grouped
