from datetime import datetime
from models import db


class PatientAllergy(db.Model):
    """
    Patient Allergy model.
    Stores allergy information following FHIR AllergyIntolerance resource.
    """
    __tablename__ = 'patient_allergies'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    patient_id = db.Column(
        db.Integer, 
        db.ForeignKey('patients.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    
    # Allergy Information
    allergen = db.Column(db.String(255), nullable=False)  # Name of the allergen
    allergen_code = db.Column(db.String(50))  # SNOMED CT, RxNorm, or other coding system
    allergen_system = db.Column(db.String(100))  # Coding system used (e.g., SNOMED CT)
    
    # Clinical Status
    clinical_status = db.Column(db.String(20), nullable=False, default='active')  # active, inactive, resolved
    verification_status = db.Column(db.String(20), default='confirmed')  # unconfirmed, confirmed, refuted, entered-in-error
    
    # Type and Category
    allergy_type = db.Column(db.String(20))  # allergy, intolerance
    category = db.Column(db.String(50))  # food, medication, environment, biologic
    
    # Criticality
    criticality = db.Column(db.String(20))  # low, high, unable-to-assess
    
    # Reaction Information
    reaction_description = db.Column(db.Text)  # Description of the reaction
    severity = db.Column(db.String(20))  # mild, moderate, severe
    manifestation = db.Column(db.Text)  # Clinical manifestations (can be JSON list)
    
    # Dates
    onset_date = db.Column(db.Date)  # When the allergy was first identified
    recorded_date = db.Column(db.DateTime, default=datetime.utcnow)  # When this record was created
    last_occurrence = db.Column(db.Date)  # Last time the reaction occurred
    
    # Additional Information
    notes = db.Column(db.Text)
    
    # Foreign key to Allergy catalog (optional)
    allergy_id = db.Column(
        db.Integer,
        db.ForeignKey('allergies.id', ondelete='SET NULL'),
        nullable=True,
        index=True
    )
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = db.relationship('Patient', backref=db.backref('allergies', lazy='dynamic', cascade='all, delete-orphan'))
    allergy = db.relationship('Allergy', back_populates='patient_allergies')
    
    def __repr__(self):
        return f'<PatientAllergy {self.allergen} for Patient {self.patient_id}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'allergen': {
                'name': self.allergen,
                'code': self.allergen_code,
                'system': self.allergen_system
            },
            'clinical_status': self.clinical_status,
            'verification_status': self.verification_status,
            'type': self.allergy_type,
            'category': self.category,
            'criticality': self.criticality,
            'reaction': {
                'description': self.reaction_description,
                'severity': self.severity,
                'manifestation': self.manifestation
            },
            'dates': {
                'onset': self.onset_date.isoformat() if self.onset_date else None,
                'recorded': self.recorded_date.isoformat() if self.recorded_date else None,
                'last_occurrence': self.last_occurrence.isoformat() if self.last_occurrence else None
            },
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def create(data):
        """Create a new patient allergy."""
        allergy = PatientAllergy(
            patient_id=data['patient_id'],
            allergen=data['allergen'],
            allergen_code=data.get('allergen_code'),
            allergen_system=data.get('allergen_system'),
            clinical_status=data.get('clinical_status', 'active'),
            verification_status=data.get('verification_status', 'confirmed'),
            allergy_type=data.get('allergy_type'),
            category=data.get('category'),
            criticality=data.get('criticality'),
            reaction_description=data.get('reaction_description'),
            severity=data.get('severity'),
            manifestation=data.get('manifestation'),
            onset_date=data.get('onset_date'),
            recorded_date=data.get('recorded_date', datetime.utcnow()),
            last_occurrence=data.get('last_occurrence'),
            notes=data.get('notes')
        )
        
        db.session.add(allergy)
        db.session.commit()
        
        return allergy
    
    def update(self, data):
        """Update allergy information."""
        if 'allergen' in data:
            self.allergen = data['allergen']
        if 'allergen_code' in data:
            self.allergen_code = data['allergen_code']
        if 'allergen_system' in data:
            self.allergen_system = data['allergen_system']
        if 'clinical_status' in data:
            self.clinical_status = data['clinical_status']
        if 'verification_status' in data:
            self.verification_status = data['verification_status']
        if 'allergy_type' in data:
            self.allergy_type = data['allergy_type']
        if 'category' in data:
            self.category = data['category']
        if 'criticality' in data:
            self.criticality = data['criticality']
        if 'reaction_description' in data:
            self.reaction_description = data['reaction_description']
        if 'severity' in data:
            self.severity = data['severity']
        if 'manifestation' in data:
            self.manifestation = data['manifestation']
        if 'onset_date' in data:
            self.onset_date = data['onset_date']
        if 'last_occurrence' in data:
            self.last_occurrence = data['last_occurrence']
        if 'notes' in data:
            self.notes = data['notes']
        
        self.updated_at = datetime.utcnow()
        db.session.commit()
    
    def delete(self):
        """Delete the allergy record."""
        db.session.delete(self)
        db.session.commit()
