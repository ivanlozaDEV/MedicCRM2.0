from datetime import datetime
from models import db


class UserSpecialty(db.Model):
    """
    UserSpecialty model for managing the many-to-many relationship between users and specialties.
    This allows medical professionals to have multiple specialties.
    """
    __tablename__ = 'user_specialties'
    
    # Composite Primary Key
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        primary_key=True
    )
    specialty_id = db.Column(
        db.Integer,
        db.ForeignKey('specialties.id', ondelete='CASCADE'),
        primary_key=True
    )
    
    # Additional Information
    is_primary = db.Column(db.Boolean, default=False)
    # Indicates if this is the user's primary/main specialty
    
    # Audit
    assigned_by = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='SET NULL')
    )
    assigned_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('user_specialties', lazy='dynamic', cascade='all, delete-orphan'))
    specialty = db.relationship('Specialty', backref=db.backref('specialty_users', lazy='dynamic'))
    assigner = db.relationship('User', foreign_keys=[assigned_by])
    
    def __repr__(self):
        return f'<UserSpecialty user_id={self.user_id} specialty_id={self.specialty_id}>'
    
    def to_dict(self):
        """
        Convert model to dictionary for JSON serialization.
        
        Returns:
            dict: UserSpecialty data as dictionary
        """
        return {
            'user_id': self.user_id,
            'specialty_id': self.specialty_id,
            'is_primary': self.is_primary,
            'assigned_by': self.assigned_by,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None
        }
    
    @classmethod
    def assign_specialty(cls, user_id, specialty_id, is_primary=False, assigned_by=None):
        """
        Assign a specialty to a user.
        
        Args:
            user_id (int): User ID
            specialty_id (int): Specialty ID
            is_primary (bool): Whether this is the primary specialty
            assigned_by (int, optional): User ID who assigned the specialty
            
        Returns:
            UserSpecialty: Created user-specialty assignment
        """
        # Check if assignment already exists
        existing = cls.query.filter_by(
            user_id=user_id,
            specialty_id=specialty_id
        ).first()
        
        if existing:
            # Update is_primary if changed
            if existing.is_primary != is_primary:
                existing.is_primary = is_primary
                db.session.commit()
            return existing
        
        # If this is primary, unset other primary specialties for this user
        if is_primary:
            cls.query.filter_by(user_id=user_id, is_primary=True).update({'is_primary': False})
        
        assignment = cls(
            user_id=user_id,
            specialty_id=specialty_id,
            is_primary=is_primary,
            assigned_by=assigned_by
        )
        db.session.add(assignment)
        db.session.commit()
        return assignment
    
    @classmethod
    def revoke_specialty(cls, user_id, specialty_id):
        """
        Revoke a specialty from a user.
        
        Args:
            user_id (int): User ID
            specialty_id (int): Specialty ID
            
        Returns:
            bool: True if revoked, False if assignment didn't exist
        """
        assignment = cls.query.filter_by(
            user_id=user_id,
            specialty_id=specialty_id
        ).first()
        
        if assignment:
            db.session.delete(assignment)
            db.session.commit()
            return True
        
        return False
    
    @classmethod
    def set_primary_specialty(cls, user_id, specialty_id):
        """
        Set a specialty as primary for a user.
        Unsets any other primary specialty.
        
        Args:
            user_id (int): User ID
            specialty_id (int): Specialty ID
            
        Returns:
            UserSpecialty: Updated assignment
        """
        # Unset all primary specialties for this user
        cls.query.filter_by(user_id=user_id, is_primary=True).update({'is_primary': False})
        
        # Set the new primary
        assignment = cls.query.filter_by(user_id=user_id, specialty_id=specialty_id).first()
        
        if assignment:
            assignment.is_primary = True
            db.session.commit()
            return assignment
        
        return None
    
    @staticmethod
    def get_user_specialties(user_id, active_only=True):
        """
        Get all specialties assigned to a user.
        
        Args:
            user_id (int): User ID
            active_only (bool): Return only active specialties
            
        Returns:
            list: List of Specialty instances
        """
        from models.specialty import Specialty
        
        query = db.session.query(Specialty).join(
            UserSpecialty,
            Specialty.id == UserSpecialty.specialty_id
        ).filter(UserSpecialty.user_id == user_id)
        
        if active_only:
            query = query.filter(Specialty.is_active == True)
        
        return query.all()
    
    @staticmethod
    def get_primary_specialty(user_id):
        """
        Get the primary specialty for a user.
        
        Args:
            user_id (int): User ID
            
        Returns:
            Specialty: Primary specialty or None
        """
        from models.specialty import Specialty
        
        assignment = UserSpecialty.query.filter_by(
            user_id=user_id,
            is_primary=True
        ).first()
        
        if assignment:
            return Specialty.query.get(assignment.specialty_id)
        
        return None
    
    @staticmethod
    def get_users_by_specialty(specialty_id):
        """
        Get all users with a specific specialty.
        
        Args:
            specialty_id (int): Specialty ID
            
        Returns:
            list: List of User instances
        """
        from models.user import User
        
        query = db.session.query(User).join(
            UserSpecialty,
            User.id == UserSpecialty.user_id
        ).filter(UserSpecialty.specialty_id == specialty_id)
        
        return query.all()
    
    @classmethod
    def assign_multiple_specialties(cls, user_id, specialty_ids, primary_specialty_id=None, assigned_by=None):
        """
        Assign multiple specialties to a user at once.
        
        Args:
            user_id (int): User ID
            specialty_ids (list): List of specialty IDs
            primary_specialty_id (int, optional): ID of the primary specialty
            assigned_by (int, optional): User ID who assigned the specialties
            
        Returns:
            list: List of created UserSpecialty instances
        """
        assignments = []
        for specialty_id in specialty_ids:
            is_primary = (specialty_id == primary_specialty_id)
            assignment = cls.assign_specialty(user_id, specialty_id, is_primary, assigned_by)
            assignments.append(assignment)
        
        return assignments
    
    @classmethod
    def replace_user_specialties(cls, user_id, specialty_ids, primary_specialty_id=None, assigned_by=None):
        """
        Replace all specialties for a user with a new set.
        
        Args:
            user_id (int): User ID
            specialty_ids (list): List of specialty IDs
            primary_specialty_id (int, optional): ID of the primary specialty
            assigned_by (int, optional): User ID who is making the change
            
        Returns:
            list: List of new UserSpecialty instances
        """
        # Remove all existing specialties for this user
        cls.query.filter_by(user_id=user_id).delete()
        
        # Add new specialties
        return cls.assign_multiple_specialties(user_id, specialty_ids, primary_specialty_id, assigned_by)
