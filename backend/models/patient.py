from datetime import datetime
from models import db


class Patient(db.Model):
    """
    Patient model for storing patient information.
    Each patient belongs to an organization.
    """
    __tablename__ = 'patients'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    organization_id = db.Column(
        db.Integer, 
        db.ForeignKey('organizations.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    
    # Personal Information
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(20))  # Male, Female, Other, Prefer not to say
    
    # Contact Information
    email = db.Column(db.String(120), index=True)
    phone = db.Column(db.String(20))
    mobile_phone = db.Column(db.String(20))
    
    # Address
    address_line1 = db.Column(db.String(255))
    address_line2 = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    postal_code = db.Column(db.String(20))
    country = db.Column(db.String(100))
    
    # Identification
    id_number = db.Column(db.String(50), index=True)  # National ID, Passport, etc.
    id_type = db.Column(db.String(50))  # Type of identification
    
    # Medical Information
    blood_type = db.Column(db.String(10))  # A+, A-, B+, B-, AB+, AB-, O+, O-
    # Note: allergies, conditions, and medications are now in separate tables
    # Kept for backward compatibility or simple notes
    allergies_notes = db.Column(db.Text)  # Legacy field for simple allergy notes
    conditions_notes = db.Column(db.Text)  # Legacy field for simple condition notes
    medications_notes = db.Column(db.Text)  # Legacy field for simple medication notes
    insurance_provider = db.Column(db.String(200))
    insurance_policy_number = db.Column(db.String(100))
    
    # Additional Information
    occupation = db.Column(db.String(100))
    marital_status = db.Column(db.String(50))  # Single, Married, Divorced, Widowed
    notes = db.Column(db.Text)  # General notes about the patient
    photo_url = db.Column(db.String(255))
    
    # Status
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = db.relationship('Organization', backref=db.backref('patients', lazy='dynamic'))
    emergency_contacts = db.relationship('PatientContact', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Patient {self.full_name}>'
    
    @property
    def full_name(self):
        """Returns the full name of the patient"""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self):
        """Calculate patient's age based on date of birth"""
        if not self.date_of_birth:
            return None
        today = datetime.utcnow().date()
        age = today.year - self.date_of_birth.year
        # Adjust if birthday hasn't occurred this year
        if today.month < self.date_of_birth.month or \
           (today.month == self.date_of_birth.month and today.day < self.date_of_birth.day):
            age -= 1
        return age
    
    @property
    def full_address(self):
        """Returns formatted full address"""
        parts = [
            self.address_line1,
            self.address_line2,
            self.city,
            self.state,
            self.postal_code,
            self.country
        ]
        return ', '.join([p for p in parts if p])
    
    def to_dict(self, include_contacts=False, include_allergies=False, include_medications=False, include_conditions=False):
        """
        Convert model to dictionary for JSON serialization.
        
        Args:
            include_contacts (bool): Include emergency contacts
            include_allergies (bool): Include allergy records
            include_medications (bool): Include medication records
            include_conditions (bool): Include condition records
            
        Returns:
            dict: Patient data
        """
        data = {
            'id': self.id,
            'organization_id': self.organization_id,
            'personal_info': {
                'first_name': self.first_name,
                'last_name': self.last_name,
                'full_name': self.full_name,
                'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
                'age': self.age,
                'gender': self.gender,
                'photo_url': self.photo_url
            },
            'contact_info': {
                'email': self.email,
                'phone': self.phone,
                'mobile_phone': self.mobile_phone,
                'address': {
                    'line1': self.address_line1,
                    'line2': self.address_line2,
                    'city': self.city,
                    'state': self.state,
                    'postal_code': self.postal_code,
                    'country': self.country,
                    'full_address': self.full_address
                }
            },
            'identification': {
                'id_number': self.id_number,
                'id_type': self.id_type
            },
            'medical_info': {
                'blood_type': self.blood_type,
                'allergies_notes': self.allergies_notes,
                'conditions_notes': self.conditions_notes,
                'medications_notes': self.medications_notes,
                'insurance_provider': self.insurance_provider,
                'insurance_policy_number': self.insurance_policy_number
            },
            'additional_info': {
                'occupation': self.occupation,
                'marital_status': self.marital_status,
                'notes': self.notes
            },
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_contacts:
            data['emergency_contacts'] = [contact.to_dict() for contact in self.emergency_contacts]
        
        if include_allergies:
            data['allergies'] = [allergy.to_dict() for allergy in self.allergies]
        
        if include_medications:
            data['medications'] = [medication.to_dict() for medication in self.medications]
        
        if include_conditions:
            data['conditions'] = [condition.to_dict() for condition in self.conditions]
        
        return data
    
    @staticmethod
    def create(data):
        """
        Create a new patient.
        
        Args:
            data (dict): Patient data
            
        Returns:
            Patient: New patient instance
        """
        patient = Patient(
            organization_id=data['organization_id'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            date_of_birth=data['date_of_birth'],
            gender=data.get('gender'),
            email=data.get('email'),
            phone=data.get('phone'),
            mobile_phone=data.get('mobile_phone'),
            address_line1=data.get('address_line1'),
            address_line2=data.get('address_line2'),
            city=data.get('city'),
            state=data.get('state'),
            postal_code=data.get('postal_code'),
            country=data.get('country'),
            id_number=data.get('id_number'),
            id_type=data.get('id_type'),
            blood_type=data.get('blood_type'),
            allergies_notes=data.get('allergies_notes'),
            conditions_notes=data.get('conditions_notes'),
            medications_notes=data.get('medications_notes'),
            insurance_provider=data.get('insurance_provider'),
            insurance_policy_number=data.get('insurance_policy_number'),
            occupation=data.get('occupation'),
            marital_status=data.get('marital_status'),
            notes=data.get('notes'),
            photo_url=data.get('photo_url')
        )
        
        db.session.add(patient)
        db.session.commit()
        
        return patient
    
    def update(self, data):
        """
        Update patient information.
        
        Args:
            data (dict): Updated patient data
        """
        # Personal Information
        if 'first_name' in data:
            self.first_name = data['first_name']
        if 'last_name' in data:
            self.last_name = data['last_name']
        if 'date_of_birth' in data:
            self.date_of_birth = data['date_of_birth']
        if 'gender' in data:
            self.gender = data['gender']
        
        # Contact Information
        if 'email' in data:
            self.email = data['email']
        if 'phone' in data:
            self.phone = data['phone']
        if 'mobile_phone' in data:
            self.mobile_phone = data['mobile_phone']
        
        # Address
        if 'address_line1' in data:
            self.address_line1 = data['address_line1']
        if 'address_line2' in data:
            self.address_line2 = data['address_line2']
        if 'city' in data:
            self.city = data['city']
        if 'state' in data:
            self.state = data['state']
        if 'postal_code' in data:
            self.postal_code = data['postal_code']
        if 'country' in data:
            self.country = data['country']
        
        # Identification
        if 'id_number' in data:
            self.id_number = data['id_number']
        if 'id_type' in data:
            self.id_type = data['id_type']
        
        # Medical Information
        if 'blood_type' in data:
            self.blood_type = data['blood_type']
        if 'allergies_notes' in data:
            self.allergies_notes = data['allergies_notes']
        if 'conditions_notes' in data:
            self.conditions_notes = data['conditions_notes']
        if 'medications_notes' in data:
            self.medications_notes = data['medications_notes']
        if 'insurance_provider' in data:
            self.insurance_provider = data['insurance_provider']
        if 'insurance_policy_number' in data:
            self.insurance_policy_number = data['insurance_policy_number']
        
        # Additional Information
        if 'occupation' in data:
            self.occupation = data['occupation']
        if 'marital_status' in data:
            self.marital_status = data['marital_status']
        if 'notes' in data:
            self.notes = data['notes']
        if 'photo_url' in data:
            self.photo_url = data['photo_url']
        
        # Status
        if 'is_active' in data:
            self.is_active = data['is_active']
        
        self.updated_at = datetime.utcnow()
        db.session.commit()
    
    def delete(self):
        """Delete the patient (soft delete by setting is_active to False)"""
        self.is_active = False
        self.updated_at = datetime.utcnow()
        db.session.commit()
    
    def hard_delete(self):
        """Permanently delete the patient from database"""
        db.session.delete(self)
        db.session.commit()
