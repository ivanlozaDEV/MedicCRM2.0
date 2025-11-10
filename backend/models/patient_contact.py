from datetime import datetime
from models import db


class PatientContact(db.Model):
    """
    Patient Emergency Contact model.
    Stores emergency contact information for patients.
    """
    __tablename__ = 'patient_contacts'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    patient_id = db.Column(
        db.Integer, 
        db.ForeignKey('patients.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    
    # Contact Information
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    relationship = db.Column(db.String(50), nullable=False)  # Mother, Father, Spouse, Sibling, Friend, etc.
    
    # Contact Details
    phone = db.Column(db.String(20), nullable=False)
    mobile_phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    
    # Address (optional)
    address_line1 = db.Column(db.String(255))
    address_line2 = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    postal_code = db.Column(db.String(20))
    country = db.Column(db.String(100))
    
    # Priority
    is_primary = db.Column(db.Boolean, nullable=False, default=False)  # Primary emergency contact
    priority_order = db.Column(db.Integer, default=1)  # Order of contact priority
    
    # Additional Information
    notes = db.Column(db.Text)  # Special notes about this contact
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<PatientContact {self.full_name} for Patient {self.patient_id}>'
    
    @property
    def full_name(self):
        """Returns the full name of the contact"""
        return f"{self.first_name} {self.last_name}"
    
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
    
    def to_dict(self):
        """
        Convert model to dictionary for JSON serialization.
        
        Returns:
            dict: Contact data
        """
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'personal_info': {
                'first_name': self.first_name,
                'last_name': self.last_name,
                'full_name': self.full_name,
                'relationship': self.relationship
            },
            'contact_info': {
                'phone': self.phone,
                'mobile_phone': self.mobile_phone,
                'email': self.email,
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
            'priority': {
                'is_primary': self.is_primary,
                'priority_order': self.priority_order
            },
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def create(data):
        """
        Create a new patient contact.
        
        Args:
            data (dict): Contact data
            
        Returns:
            PatientContact: New contact instance
        """
        contact = PatientContact(
            patient_id=data['patient_id'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            relationship=data['relationship'],
            phone=data['phone'],
            mobile_phone=data.get('mobile_phone'),
            email=data.get('email'),
            address_line1=data.get('address_line1'),
            address_line2=data.get('address_line2'),
            city=data.get('city'),
            state=data.get('state'),
            postal_code=data.get('postal_code'),
            country=data.get('country'),
            is_primary=data.get('is_primary', False),
            priority_order=data.get('priority_order', 1),
            notes=data.get('notes')
        )
        
        db.session.add(contact)
        db.session.commit()
        
        return contact
    
    def update(self, data):
        """
        Update contact information.
        
        Args:
            data (dict): Updated contact data
        """
        if 'first_name' in data:
            self.first_name = data['first_name']
        if 'last_name' in data:
            self.last_name = data['last_name']
        if 'relationship' in data:
            self.relationship = data['relationship']
        if 'phone' in data:
            self.phone = data['phone']
        if 'mobile_phone' in data:
            self.mobile_phone = data['mobile_phone']
        if 'email' in data:
            self.email = data['email']
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
        if 'is_primary' in data:
            self.is_primary = data['is_primary']
        if 'priority_order' in data:
            self.priority_order = data['priority_order']
        if 'notes' in data:
            self.notes = data['notes']
        
        self.updated_at = datetime.utcnow()
        db.session.commit()
    
    def delete(self):
        """Permanently delete the contact from database"""
        db.session.delete(self)
        db.session.commit()
