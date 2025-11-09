from datetime import datetime
from models import db


class Permission(db.Model):
    """
    Permission model for defining system-wide permissions.
    Permissions are assigned to roles to control access to different modules.
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
    
    # Permission module constants
    # Clinical Permissions
    PERM_PATIENTS_VIEW = 'patients.view'
    PERM_PATIENTS_CREATE = 'patients.create'
    PERM_PATIENTS_EDIT = 'patients.edit'
    PERM_PATIENTS_DELETE = 'patients.delete'
    
    PERM_APPOINTMENTS_VIEW = 'appointments.view'
    PERM_APPOINTMENTS_CREATE = 'appointments.create'
    PERM_APPOINTMENTS_EDIT = 'appointments.edit'
    PERM_APPOINTMENTS_DELETE = 'appointments.delete'
    
    PERM_MEDICAL_RECORDS_VIEW = 'medical_records.view'
    PERM_MEDICAL_RECORDS_CREATE = 'medical_records.create'
    PERM_MEDICAL_RECORDS_EDIT = 'medical_records.edit'
    PERM_MEDICAL_RECORDS_DELETE = 'medical_records.delete'
    
    PERM_PRESCRIPTIONS_VIEW = 'prescriptions.view'
    PERM_PRESCRIPTIONS_CREATE = 'prescriptions.create'
    PERM_PRESCRIPTIONS_EDIT = 'prescriptions.edit'
    
    # Administrative Permissions
    PERM_BILLING_VIEW = 'billing.view'
    PERM_BILLING_CREATE = 'billing.create'
    PERM_BILLING_EDIT = 'billing.edit'
    PERM_BILLING_DELETE = 'billing.delete'
    
    PERM_PAYMENTS_VIEW = 'payments.view'
    PERM_PAYMENTS_PROCESS = 'payments.process'
    
    PERM_REPORTS_VIEW = 'reports.view'
    PERM_REPORTS_EXPORT = 'reports.export'
    
    # System Permissions
    PERM_USERS_VIEW = 'users.view'
    PERM_USERS_CREATE = 'users.create'
    PERM_USERS_EDIT = 'users.edit'
    PERM_USERS_DELETE = 'users.delete'
    
    PERM_ROLES_VIEW = 'roles.view'
    PERM_ROLES_CREATE = 'roles.create'
    PERM_ROLES_EDIT = 'roles.edit'
    PERM_ROLES_DELETE = 'roles.delete'
    
    PERM_SETTINGS_VIEW = 'settings.view'
    PERM_SETTINGS_EDIT = 'settings.edit'
    
    PERM_ORGANIZATION_EDIT = 'organization.edit'
    
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
            module_key (str): Unique module key
            display_name (str): Display name for UI
            category (str): Permission category
            description (str, optional): Permission description
            
        Returns:
            Permission: Created permission instance
        """
        if category not in cls.CATEGORIES:
            raise ValueError(f"Invalid category: {category}. Must be one of {cls.CATEGORIES}")
        
        permission = cls(
            module_key=module_key,
            display_name=display_name,
            category=category,
            description=description
        )
        db.session.add(permission)
        db.session.commit()
        return permission
    
    @staticmethod
    def create_default_permissions():
        """
        Create all default system permissions.
        This should be run once during initial setup.
        
        Returns:
            list: List of created permissions
        """
        default_permissions = [
            # Clinical Permissions
            {
                'module_key': Permission.PERM_PATIENTS_VIEW,
                'display_name': 'View Patients',
                'description': 'View patient list and details',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_PATIENTS_CREATE,
                'display_name': 'Create Patients',
                'description': 'Add new patients to the system',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_PATIENTS_EDIT,
                'display_name': 'Edit Patients',
                'description': 'Modify patient information',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_PATIENTS_DELETE,
                'display_name': 'Delete Patients',
                'description': 'Remove patients from the system',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_APPOINTMENTS_VIEW,
                'display_name': 'View Appointments',
                'description': 'View appointment calendar and details',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_APPOINTMENTS_CREATE,
                'display_name': 'Create Appointments',
                'description': 'Schedule new appointments',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_APPOINTMENTS_EDIT,
                'display_name': 'Edit Appointments',
                'description': 'Modify appointment details',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_APPOINTMENTS_DELETE,
                'display_name': 'Cancel Appointments',
                'description': 'Cancel or delete appointments',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_MEDICAL_RECORDS_VIEW,
                'display_name': 'View Medical Records',
                'description': 'Access patient medical history',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_MEDICAL_RECORDS_CREATE,
                'display_name': 'Create Medical Records',
                'description': 'Add new medical records',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_MEDICAL_RECORDS_EDIT,
                'display_name': 'Edit Medical Records',
                'description': 'Update medical records',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_MEDICAL_RECORDS_DELETE,
                'display_name': 'Delete Medical Records',
                'description': 'Remove medical records',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_PRESCRIPTIONS_VIEW,
                'display_name': 'View Prescriptions',
                'description': 'View patient prescriptions',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_PRESCRIPTIONS_CREATE,
                'display_name': 'Create Prescriptions',
                'description': 'Issue new prescriptions',
                'category': Permission.CATEGORY_CLINICAL
            },
            {
                'module_key': Permission.PERM_PRESCRIPTIONS_EDIT,
                'display_name': 'Edit Prescriptions',
                'description': 'Modify prescriptions',
                'category': Permission.CATEGORY_CLINICAL
            },
            
            # Administrative Permissions
            {
                'module_key': Permission.PERM_BILLING_VIEW,
                'display_name': 'View Billing',
                'description': 'View invoices and billing information',
                'category': Permission.CATEGORY_ADMINISTRATIVE
            },
            {
                'module_key': Permission.PERM_BILLING_CREATE,
                'display_name': 'Create Invoices',
                'description': 'Generate new invoices',
                'category': Permission.CATEGORY_ADMINISTRATIVE
            },
            {
                'module_key': Permission.PERM_BILLING_EDIT,
                'display_name': 'Edit Billing',
                'description': 'Modify billing information',
                'category': Permission.CATEGORY_ADMINISTRATIVE
            },
            {
                'module_key': Permission.PERM_BILLING_DELETE,
                'display_name': 'Delete Invoices',
                'description': 'Remove invoices',
                'category': Permission.CATEGORY_ADMINISTRATIVE
            },
            {
                'module_key': Permission.PERM_PAYMENTS_VIEW,
                'display_name': 'View Payments',
                'description': 'View payment records',
                'category': Permission.CATEGORY_ADMINISTRATIVE
            },
            {
                'module_key': Permission.PERM_PAYMENTS_PROCESS,
                'display_name': 'Process Payments',
                'description': 'Record and process payments',
                'category': Permission.CATEGORY_ADMINISTRATIVE
            },
            {
                'module_key': Permission.PERM_REPORTS_VIEW,
                'display_name': 'View Reports',
                'description': 'Access system reports and analytics',
                'category': Permission.CATEGORY_ADMINISTRATIVE
            },
            {
                'module_key': Permission.PERM_REPORTS_EXPORT,
                'display_name': 'Export Reports',
                'description': 'Export reports to external formats',
                'category': Permission.CATEGORY_ADMINISTRATIVE
            },
            
            # System Permissions
            {
                'module_key': Permission.PERM_USERS_VIEW,
                'display_name': 'View Users',
                'description': 'View system users',
                'category': Permission.CATEGORY_SYSTEM
            },
            {
                'module_key': Permission.PERM_USERS_CREATE,
                'display_name': 'Create Users',
                'description': 'Add new users to the system',
                'category': Permission.CATEGORY_SYSTEM
            },
            {
                'module_key': Permission.PERM_USERS_EDIT,
                'display_name': 'Edit Users',
                'description': 'Modify user information',
                'category': Permission.CATEGORY_SYSTEM
            },
            {
                'module_key': Permission.PERM_USERS_DELETE,
                'display_name': 'Delete Users',
                'description': 'Remove users from the system',
                'category': Permission.CATEGORY_SYSTEM
            },
            {
                'module_key': Permission.PERM_ROLES_VIEW,
                'display_name': 'View Roles',
                'description': 'View role definitions',
                'category': Permission.CATEGORY_SYSTEM
            },
            {
                'module_key': Permission.PERM_ROLES_CREATE,
                'display_name': 'Create Roles',
                'description': 'Create new roles',
                'category': Permission.CATEGORY_SYSTEM
            },
            {
                'module_key': Permission.PERM_ROLES_EDIT,
                'display_name': 'Edit Roles',
                'description': 'Modify role permissions',
                'category': Permission.CATEGORY_SYSTEM
            },
            {
                'module_key': Permission.PERM_ROLES_DELETE,
                'display_name': 'Delete Roles',
                'description': 'Remove custom roles',
                'category': Permission.CATEGORY_SYSTEM
            },
            {
                'module_key': Permission.PERM_SETTINGS_VIEW,
                'display_name': 'View Settings',
                'description': 'View system settings',
                'category': Permission.CATEGORY_SYSTEM
            },
            {
                'module_key': Permission.PERM_SETTINGS_EDIT,
                'display_name': 'Edit Settings',
                'description': 'Modify system settings',
                'category': Permission.CATEGORY_SYSTEM
            },
            {
                'module_key': Permission.PERM_ORGANIZATION_EDIT,
                'display_name': 'Edit Organization',
                'description': 'Modify organization information',
                'category': Permission.CATEGORY_SYSTEM
            }
        ]
        
        created_permissions = []
        for perm_data in default_permissions:
            # Check if permission already exists
            existing = Permission.query.filter_by(module_key=perm_data['module_key']).first()
            
            if not existing:
                permission = Permission.create(**perm_data)
                created_permissions.append(permission)
            else:
                created_permissions.append(existing)
        
        return created_permissions
    
    @staticmethod
    def find_by_key(module_key):
        """
        Find permission by module key.
        
        Args:
            module_key (str): Module key
            
        Returns:
            Permission: Permission instance or None
        """
        return Permission.query.filter_by(module_key=module_key).first()
    
    @staticmethod
    def find_by_category(category):
        """
        Find all permissions in a category.
        
        Args:
            category (str): Category name
            
        Returns:
            list: List of Permission instances
        """
        return Permission.query.filter_by(category=category).order_by(Permission.display_name).all()
    
    @staticmethod
    def get_all_grouped():
        """
        Get all permissions grouped by category.
        
        Returns:
            dict: Dictionary with categories as keys and permission lists as values
        """
        permissions = Permission.query.order_by(Permission.category, Permission.display_name).all()
        
        grouped = {
            Permission.CATEGORY_CLINICAL: [],
            Permission.CATEGORY_ADMINISTRATIVE: [],
            Permission.CATEGORY_SYSTEM: []
        }
        
        for perm in permissions:
            if perm.category in grouped:
                grouped[perm.category].append(perm.to_dict())
        
        return grouped
