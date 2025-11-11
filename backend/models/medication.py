from datetime import datetime
from models import db


class Medication(db.Model):
    """
    Medication catalog model.
    Global catalog of medications with standardized codes (RxNorm, NDC).
    Used as reference for patient medications.
    """
    __tablename__ = 'medications'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Medication Information
    name = db.Column(db.String(255), nullable=False, unique=True, index=True)
    generic_name = db.Column(db.String(255))  # Generic/chemical name
    brand_names = db.Column(db.JSON)  # Array of brand names
    description = db.Column(db.Text)
    
    # Standardized Codes
    rxnorm_code = db.Column(db.String(50), index=True)  # RxNorm code
    ndc_code = db.Column(db.String(50), index=True)  # National Drug Code
    atc_code = db.Column(db.String(20))  # Anatomical Therapeutic Chemical code
    
    # Classification
    category = db.Column(db.String(50), index=True)  # antibiotic, analgesic, antihypertensive, etc.
    drug_class = db.Column(db.String(100))  # Pharmacological class
    
    # Common Dosing Information (reference)
    typical_doses = db.Column(db.JSON)  # Array of common doses (e.g., ["500 mg", "1000 mg"])
    typical_routes = db.Column(db.JSON)  # Array of common routes (e.g., ["oral", "IV"])
    typical_frequencies = db.Column(db.JSON)  # Array of common frequencies (e.g., ["twice daily", "every 8 hours"])
    
    # Common Uses
    common_indications = db.Column(db.JSON)  # Array of common uses/indications
    
    # Safety Information
    requires_prescription = db.Column(db.Boolean, default=True)
    controlled_substance = db.Column(db.String(20))  # DEA schedule if applicable (I, II, III, IV, V)
    
    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient_medications = db.relationship('PatientMedication', back_populates='medication', lazy='dynamic')
    
    def __repr__(self):
        return f'<Medication {self.name}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'name': self.name,
            'generic_name': self.generic_name,
            'brand_names': self.brand_names,
            'description': self.description,
            'codes': {
                'rxnorm': self.rxnorm_code,
                'ndc': self.ndc_code,
                'atc': self.atc_code
            },
            'category': self.category,
            'drug_class': self.drug_class,
            'typical_info': {
                'doses': self.typical_doses,
                'routes': self.typical_routes,
                'frequencies': self.typical_frequencies
            },
            'common_indications': self.common_indications,
            'safety': {
                'requires_prescription': self.requires_prescription,
                'controlled_substance': self.controlled_substance
            },
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def create(data):
        """Create a new medication in the catalog."""
        medication = Medication(
            name=data['name'],
            generic_name=data.get('generic_name'),
            brand_names=data.get('brand_names'),
            description=data.get('description'),
            rxnorm_code=data.get('rxnorm_code'),
            ndc_code=data.get('ndc_code'),
            atc_code=data.get('atc_code'),
            category=data.get('category'),
            drug_class=data.get('drug_class'),
            typical_doses=data.get('typical_doses'),
            typical_routes=data.get('typical_routes'),
            typical_frequencies=data.get('typical_frequencies'),
            common_indications=data.get('common_indications'),
            requires_prescription=data.get('requires_prescription', True),
            controlled_substance=data.get('controlled_substance'),
            is_active=data.get('is_active', True)
        )
        db.session.add(medication)
        db.session.commit()
        return medication
    
    def update(self, data):
        """Update medication information."""
        if 'name' in data:
            self.name = data['name']
        if 'generic_name' in data:
            self.generic_name = data['generic_name']
        if 'brand_names' in data:
            self.brand_names = data['brand_names']
        if 'description' in data:
            self.description = data['description']
        if 'rxnorm_code' in data:
            self.rxnorm_code = data['rxnorm_code']
        if 'ndc_code' in data:
            self.ndc_code = data['ndc_code']
        if 'atc_code' in data:
            self.atc_code = data['atc_code']
        if 'category' in data:
            self.category = data['category']
        if 'drug_class' in data:
            self.drug_class = data['drug_class']
        if 'typical_doses' in data:
            self.typical_doses = data['typical_doses']
        if 'typical_routes' in data:
            self.typical_routes = data['typical_routes']
        if 'typical_frequencies' in data:
            self.typical_frequencies = data['typical_frequencies']
        if 'common_indications' in data:
            self.common_indications = data['common_indications']
        if 'requires_prescription' in data:
            self.requires_prescription = data['requires_prescription']
        if 'controlled_substance' in data:
            self.controlled_substance = data['controlled_substance']
        if 'is_active' in data:
            self.is_active = data['is_active']
        
        db.session.commit()
        return self
    
    def delete(self):
        """Soft delete - mark as inactive instead of deleting."""
        self.is_active = False
        db.session.commit()
        return self
