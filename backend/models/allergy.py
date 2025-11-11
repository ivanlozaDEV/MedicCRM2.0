from datetime import datetime
from models import db


class Allergy(db.Model):
    """
    Allergy catalog model.
    Global catalog of allergens with standardized codes (SNOMED CT, RxNorm).
    Used as reference for patient allergies.
    """
    __tablename__ = 'allergies'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Allergen Information
    name = db.Column(db.String(255), nullable=False, unique=True, index=True)
    description = db.Column(db.Text)
    
    # Standardized Codes
    snomed_code = db.Column(db.String(50), index=True)  # SNOMED CT code
    rxnorm_code = db.Column(db.String(50), index=True)  # RxNorm code (for medications)
    
    # Classification
    category = db.Column(db.String(50), index=True)  # food, medication, environment, biologic
    allergy_type = db.Column(db.String(20))  # allergy, intolerance
    
    # Common Information
    common_reactions = db.Column(db.JSON)  # List of common reactions as JSON array
    typical_severity = db.Column(db.String(20))  # mild, moderate, severe
    
    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient_allergies = db.relationship('PatientAllergy', back_populates='allergy', lazy='dynamic')
    
    def __repr__(self):
        return f'<Allergy {self.name}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'codes': {
                'snomed': self.snomed_code,
                'rxnorm': self.rxnorm_code
            },
            'category': self.category,
            'type': self.allergy_type,
            'common_reactions': self.common_reactions,
            'typical_severity': self.typical_severity,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def create(data):
        """Create a new allergy in the catalog."""
        allergy = Allergy(
            name=data['name'],
            description=data.get('description'),
            snomed_code=data.get('snomed_code'),
            rxnorm_code=data.get('rxnorm_code'),
            category=data.get('category'),
            allergy_type=data.get('allergy_type'),
            common_reactions=data.get('common_reactions'),
            typical_severity=data.get('typical_severity'),
            is_active=data.get('is_active', True)
        )
        db.session.add(allergy)
        db.session.commit()
        return allergy
    
    def update(self, data):
        """Update allergy information."""
        if 'name' in data:
            self.name = data['name']
        if 'description' in data:
            self.description = data['description']
        if 'snomed_code' in data:
            self.snomed_code = data['snomed_code']
        if 'rxnorm_code' in data:
            self.rxnorm_code = data['rxnorm_code']
        if 'category' in data:
            self.category = data['category']
        if 'allergy_type' in data:
            self.allergy_type = data['allergy_type']
        if 'common_reactions' in data:
            self.common_reactions = data['common_reactions']
        if 'typical_severity' in data:
            self.typical_severity = data['typical_severity']
        if 'is_active' in data:
            self.is_active = data['is_active']
        
        db.session.commit()
        return self
    
    def delete(self):
        """Soft delete - mark as inactive instead of deleting."""
        self.is_active = False
        db.session.commit()
        return self
