from datetime import datetime
from models import db


class User(db.Model):
    """
    User model for system users.
    Each user belongs to an organization and has authentication credentials.
    """
    __tablename__ = 'users'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    organization_id = db.Column(
        db.Integer, 
        db.ForeignKey('organizations.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    
    # Credentials
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Personal Information
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    photo_url = db.Column(db.String(255))
    
    # Professional Information (for medical staff)
    medical_license = db.Column(db.String(100))  # License number
    professional_id = db.Column(db.String(100))  # Professional ID (e.g., Cedula Profesional)
    specialties = db.Column(db.Text)  # JSON array of specialties
    # Example: '["Cardiology", "Internal Medicine"]'
    
    # Password Reset
    reset_token = db.Column(db.String(100))
    reset_token_expires = db.Column(db.DateTime)
    
    # Status
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = db.relationship('Organization', backref=db.backref('users', lazy='dynamic'))
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    @property
    def full_name(self):
        """Returns the full name of the user"""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def specialties_list(self):
        """
        Returns specialties as a Python list.
        
        Returns:
            list: List of specialty strings
        """
        if not self.specialties:
            return []
        
        import json
        try:
            return json.loads(self.specialties)
        except (json.JSONDecodeError, TypeError):
            return []
    
    @property
    def is_medical_professional(self):
        """
        Check if user has medical credentials.
        
        Returns:
            bool: True if has license or professional ID
        """
        return bool(self.medical_license or self.professional_id)
    
    def to_dict(self, include_sensitive=False):
        """
        Convert model to dictionary for JSON serialization.
        
        Args:
            include_sensitive (bool): Include sensitive data like password_hash
            
        Returns:
            dict: User data as dictionary
        """
        data = {
            'id': self.id,
            'organization_id': self.organization_id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'phone': self.phone,
            'photo_url': self.photo_url,
            'professional_info': {
                'medical_license': self.medical_license,
                'professional_id': self.professional_id,
                'specialties': self.specialties_list,
                'is_medical_professional': self.is_medical_professional
            },
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_sensitive:
            data['password_hash'] = self.password_hash
            data['reset_token'] = self.reset_token
            data['reset_token_expires'] = self.reset_token_expires.isoformat() if self.reset_token_expires else None
        
        return data
    
    def set_specialties(self, specialties_list):
        """
        Set user specialties from a list.
        
        Args:
            specialties_list (list): List of specialty strings
        """
        import json
        
        if not isinstance(specialties_list, list):
            raise ValueError("Specialties must be a list")
        
        self.specialties = json.dumps(specialties_list)
        self.updated_at = datetime.utcnow()
        db.session.commit()
    
    def add_specialty(self, specialty):
        """
        Add a specialty to the user.
        
        Args:
            specialty (str): Specialty name to add
        """
        current_specialties = self.specialties_list
        
        if specialty not in current_specialties:
            current_specialties.append(specialty)
            self.set_specialties(current_specialties)
    
    def remove_specialty(self, specialty):
        """
        Remove a specialty from the user.
        
        Args:
            specialty (str): Specialty name to remove
        """
        current_specialties = self.specialties_list
        
        if specialty in current_specialties:
            current_specialties.remove(specialty)
            self.set_specialties(current_specialties)
    
    @classmethod
    def create(cls, password, **kwargs):
        """
        Create a new user with hashed password.
        
        Args:
            password (str): Plain text password
            **kwargs: Other user attributes
            
        Returns:
            User: Created user instance
        """
        from werkzeug.security import generate_password_hash
        
        user = cls(**kwargs)
        user.password_hash = generate_password_hash(password)
        db.session.add(user)
        db.session.commit()
        return user
    
    def update(self, **kwargs):
        """
        Update user attributes.
        
        Args:
            **kwargs: Attributes to update
            
        Returns:
            User: Updated user instance
        """
        for key, value in kwargs.items():
            if hasattr(self, key) and key != 'password_hash':
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def set_password(self, password):
        """
        Set a new password for the user.
        
        Args:
            password (str): Plain text password
        """
        from werkzeug.security import generate_password_hash
        
        self.password_hash = generate_password_hash(password)
        self.updated_at = datetime.utcnow()
        db.session.commit()
    
    def check_password(self, password):
        """
        Verify password against hash.
        
        Args:
            password (str): Plain text password to verify
            
        Returns:
            bool: True if password matches, False otherwise
        """
        from werkzeug.security import check_password_hash
        
        return check_password_hash(self.password_hash, password)
    
    def generate_reset_token(self):
        """
        Generate a password reset token.
        
        Returns:
            str: Reset token
        """
        import secrets
        from datetime import timedelta
        
        self.reset_token = secrets.token_urlsafe(32)
        self.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
        db.session.commit()
        return self.reset_token
    
    def verify_reset_token(self, token):
        """
        Verify if reset token is valid and not expired.
        
        Args:
            token (str): Token to verify
            
        Returns:
            bool: True if valid, False otherwise
        """
        if not self.reset_token or not self.reset_token_expires:
            return False
        
        if self.reset_token != token:
            return False
        
        if datetime.utcnow() > self.reset_token_expires:
            return False
        
        return True
    
    def clear_reset_token(self):
        """Clear the password reset token"""
        self.reset_token = None
        self.reset_token_expires = None
        db.session.commit()
    
    def delete(self):
        """Soft delete - marks user as inactive"""
        self.is_active = False
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def hard_delete(self):
        """Hard delete - permanently removes user from database"""
        db.session.delete(self)
        db.session.commit()
    
    @staticmethod
    def find_by_email(email):
        """
        Find user by email.
        
        Args:
            email (str): Email to search
            
        Returns:
            User: User instance or None
        """
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def find_by_username(username):
        """
        Find user by username.
        
        Args:
            username (str): Username to search
            
        Returns:
            User: User instance or None
        """
        return User.query.filter_by(username=username).first()
    
    @staticmethod
    def find_by_organization(organization_id, active_only=True):
        """
        Find all users in an organization.
        
        Args:
            organization_id (int): Organization ID
            active_only (bool): Return only active users
            
        Returns:
            list: List of User instances
        """
        query = User.query.filter_by(organization_id=organization_id)
        if active_only:
            query = query.filter_by(is_active=True)
        return query.all()
