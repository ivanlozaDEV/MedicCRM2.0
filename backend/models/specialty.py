from datetime import datetime
from models import db


class Specialty(db.Model):
    """
    Specialty model for managing medical specialties.
    Users (medical professionals) can be assigned multiple specialties via UserSpecialty.
    """
    __tablename__ = 'specialties'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Information
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    
    # Configuration
    default_appointment_duration = db.Column(db.Integer, default=30)  # in minutes
    default_color = db.Column(db.String(7), default='#3B82F6')  # Hex color
    
    # Status
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Specialty {self.name}>'
    
    @property
    def user_count(self):
        """Get count of users with this specialty"""
        # This will be implemented when UserSpecialty model is created
        # For now, return 0
        return 0
    
    def to_dict(self, include_users=False):
        """
        Convert model to dictionary for JSON serialization.
        
        Args:
            include_users (bool): Include list of users with this specialty
            
        Returns:
            dict: Specialty data as dictionary
        """
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'default_appointment_duration': self.default_appointment_duration,
            'default_color': self.default_color,
            'is_active': self.is_active,
            'user_count': self.user_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_users:
            # This will be implemented when UserSpecialty model is created
            data['users'] = []
        
        return data
    
    @classmethod
    def create(cls, name, **kwargs):
        """
        Create a new specialty.
        
        Args:
            name (str): Specialty name
            **kwargs: Additional specialty attributes
            
        Returns:
            Specialty: Created specialty instance
        """
        # Check if specialty already exists
        existing = cls.query.filter_by(name=name).first()
        if existing:
            raise ValueError(f"Specialty '{name}' already exists")
        
        specialty = cls(name=name, **kwargs)
        db.session.add(specialty)
        db.session.commit()
        return specialty
    
    def update(self, **kwargs):
        """
        Update specialty attributes.
        
        Args:
            **kwargs: Attributes to update
            
        Returns:
            Specialty: Updated specialty instance
        """
        for key, value in kwargs.items():
            if hasattr(self, key) and key != 'id':
                setattr(self, key, value)
        
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def deactivate(self):
        """
        Deactivate specialty (soft delete).
        
        Returns:
            Specialty: Updated specialty instance
        """
        self.is_active = False
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def activate(self):
        """
        Activate specialty.
        
        Returns:
            Specialty: Updated specialty instance
        """
        self.is_active = True
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def delete(self):
        """
        Delete specialty.
        Can only delete if no users are assigned.
        
        Returns:
            bool: True if deleted
            
        Raises:
            ValueError: If specialty has assigned users
        """
        if self.user_count > 0:
            raise ValueError(f"Cannot delete specialty with {self.user_count} assigned users")
        
        db.session.delete(self)
        db.session.commit()
        return True
    
    @staticmethod
    def find_by_name(name):
        """
        Find specialty by name.
        
        Args:
            name (str): Specialty name
            
        Returns:
            Specialty: Specialty instance or None
        """
        return Specialty.query.filter_by(name=name).first()
    
    @staticmethod
    def get_all(active_only=False):
        """
        Get all specialties.
        
        Args:
            active_only (bool): Return only active specialties
            
        Returns:
            list: List of Specialty instances
        """
        query = Specialty.query
        
        if active_only:
            query = query.filter_by(is_active=True)
        
        return query.order_by(Specialty.name).all()
    
    @staticmethod
    def create_default_specialties():
        """
        Create common medical specialties for initial setup.
        
        Returns:
            list: List of created specialties
        """
        default_specialties = [
            {
                'name': 'General Medicine',
                'description': 'General practice and family medicine',
                'default_appointment_duration': 30,
                'default_color': '#3B82F6'
            },
            {
                'name': 'Cardiology',
                'description': 'Heart and cardiovascular system',
                'default_appointment_duration': 45,
                'default_color': '#EF4444'
            },
            {
                'name': 'Pediatrics',
                'description': 'Medical care for children',
                'default_appointment_duration': 30,
                'default_color': '#F59E0B'
            },
            {
                'name': 'Dermatology',
                'description': 'Skin, hair, and nails',
                'default_appointment_duration': 30,
                'default_color': '#EC4899'
            },
            {
                'name': 'Orthopedics',
                'description': 'Bones, joints, and muscles',
                'default_appointment_duration': 45,
                'default_color': '#8B5CF6'
            },
            {
                'name': 'Gynecology',
                'description': 'Women\'s reproductive health',
                'default_appointment_duration': 30,
                'default_color': '#EC4899'
            },
            {
                'name': 'Ophthalmology',
                'description': 'Eye and vision care',
                'default_appointment_duration': 30,
                'default_color': '#06B6D4'
            },
            {
                'name': 'Psychiatry',
                'description': 'Mental health',
                'default_appointment_duration': 60,
                'default_color': '#6366F1'
            },
            {
                'name': 'Neurology',
                'description': 'Brain and nervous system',
                'default_appointment_duration': 45,
                'default_color': '#8B5CF6'
            },
            {
                'name': 'Dentistry',
                'description': 'Oral and dental health',
                'default_appointment_duration': 45,
                'default_color': '#14B8A6'
            }
        ]
        
        created_specialties = []
        for specialty_data in default_specialties:
            # Check if specialty already exists
            existing = Specialty.find_by_name(specialty_data['name'])
            
            if not existing:
                specialty = Specialty.create(**specialty_data)
                created_specialties.append(specialty)
            else:
                created_specialties.append(existing)
        
        return created_specialties
