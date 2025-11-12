from datetime import datetime
from models import db


class PatientMedication(db.Model):
    """
    Patient Medication model.
    Stores medication information following FHIR MedicationStatement resource.
    """
    __tablename__ = 'patient_medications'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    patient_id = db.Column(
        db.Integer, 
        db.ForeignKey('patients.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    medication_id = db.Column(
        db.Integer,
        db.ForeignKey('medications.id', ondelete='SET NULL'),
        nullable=True,  # Optional - allows custom medications not in catalog
        index=True
    )
    
    # Medication Information
    medication_name = db.Column(db.String(255), nullable=False)  # Name of the medication
    medication_code = db.Column(db.String(50), nullable=True)  # RxNorm, NDC, or other coding system
    medication_system = db.Column(db.String(100), nullable=True)  # Coding system used (e.g., RxNorm)
    
    # Status
    status = db.Column(db.String(20), nullable=True, default='active')  # active, completed, stopped, on-hold
    
    # Dosage Information
    dosage_text = db.Column(db.String(500), nullable=True)  # Free text dosage instructions
    dose = db.Column(db.String(100), nullable=True)  # Dose amount (e.g., "500 mg")
    route = db.Column(db.String(100), nullable=True)  # Route of administration (oral, IV, topical, etc.)
    frequency = db.Column(db.String(100), nullable=True)  # How often (e.g., "twice daily", "every 6 hours")
    
    # Timing
    start_date = db.Column(db.Date, nullable=True)  # When the medication was started
    end_date = db.Column(db.Date, nullable=True)  # When the medication was stopped (if applicable)
    
    # Reason
    reason_code = db.Column(db.String(50), nullable=True)  # ICD-10, SNOMED CT code for the condition
    reason_text = db.Column(db.String(255), nullable=True)  # Free text reason for taking
    
    # Prescriber Information
    prescriber_name = db.Column(db.String(200), nullable=True)  # Name of the prescribing provider
    prescriber_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)  # Link to user if internal
    
    # Additional Information
    pharmacy = db.Column(db.String(200), nullable=True)  # Pharmacy name
    refills_remaining = db.Column(db.Integer, nullable=True)  # Number of refills left
    is_prn = db.Column(db.Boolean, default=False, nullable=False)  # PRN (as needed) medication
    notes = db.Column(db.Text, nullable=True)  # Additional notes
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = db.relationship('Patient', backref=db.backref('medications', lazy='dynamic', cascade='all, delete-orphan'))
    medication = db.relationship('Medication', back_populates='patient_medications')  # Link to medication catalog
    prescriber = db.relationship('User', foreign_keys=[prescriber_id])
    
    def __repr__(self):
        return f'<PatientMedication {self.medication_name} for Patient {self.patient_id}>'
    
    @property
    def is_current(self):
        """Check if medication is currently active."""
        if self.status not in ['active', 'on-hold']:
            return False
        if self.end_date and self.end_date < datetime.utcnow().date():
            return False
        return True
    
    def to_dict(self, include_prescriber=False):
        """Convert model to dictionary for JSON serialization."""
        data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'medication': {
                'name': self.medication_name,
                'code': self.medication_code,
                'system': self.medication_system
            },
            'status': self.status,
            'is_current': self.is_current,
            'dosage': {
                'text': self.dosage_text,
                'dose': self.dose,
                'route': self.route,
                'frequency': self.frequency,
                'is_prn': self.is_prn
            },
            'timing': {
                'start_date': self.start_date.isoformat() if self.start_date else None,
                'end_date': self.end_date.isoformat() if self.end_date else None
            },
            'reason': {
                'code': self.reason_code,
                'text': self.reason_text
            },
            'prescriber_name': self.prescriber_name,
            'pharmacy': self.pharmacy,
            'refills_remaining': self.refills_remaining,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_prescriber and self.prescriber:
            data['prescriber'] = {
                'id': self.prescriber.id,
                'name': self.prescriber.full_name,
                'email': self.prescriber.email
            }
        
        return data
    
    @staticmethod
    def create(data):
        """Create a new patient medication."""
        medication = PatientMedication(
            patient_id=data['patient_id'],
            medication_name=data['medication_name'],
            medication_code=data.get('medication_code'),
            medication_system=data.get('medication_system'),
            status=data.get('status', 'active'),
            dosage_text=data.get('dosage_text'),
            dose=data.get('dose'),
            route=data.get('route'),
            frequency=data.get('frequency'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            reason_code=data.get('reason_code'),
            reason_text=data.get('reason_text'),
            prescriber_name=data.get('prescriber_name'),
            prescriber_id=data.get('prescriber_id'),
            pharmacy=data.get('pharmacy'),
            refills_remaining=data.get('refills_remaining'),
            is_prn=data.get('is_prn', False),
            notes=data.get('notes')
        )
        
        db.session.add(medication)
        db.session.commit()
        
        return medication
    
    def update(self, data):
        """Update medication information."""
        if 'medication_name' in data:
            self.medication_name = data['medication_name']
        if 'medication_code' in data:
            self.medication_code = data['medication_code']
        if 'medication_system' in data:
            self.medication_system = data['medication_system']
        if 'status' in data:
            self.status = data['status']
        if 'dosage_text' in data:
            self.dosage_text = data['dosage_text']
        if 'dose' in data:
            self.dose = data['dose']
        if 'route' in data:
            self.route = data['route']
        if 'frequency' in data:
            self.frequency = data['frequency']
        if 'start_date' in data:
            self.start_date = data['start_date']
        if 'end_date' in data:
            self.end_date = data['end_date']
        if 'reason_code' in data:
            self.reason_code = data['reason_code']
        if 'reason_text' in data:
            self.reason_text = data['reason_text']
        if 'prescriber_name' in data:
            self.prescriber_name = data['prescriber_name']
        if 'prescriber_id' in data:
            self.prescriber_id = data['prescriber_id']
        if 'pharmacy' in data:
            self.pharmacy = data['pharmacy']
        if 'refills_remaining' in data:
            self.refills_remaining = data['refills_remaining']
        if 'is_prn' in data:
            self.is_prn = data['is_prn']
        if 'notes' in data:
            self.notes = data['notes']
        
        self.updated_at = datetime.utcnow()
        db.session.commit()
    
    def delete(self):
        """Delete the medication record."""
        db.session.delete(self)
        db.session.commit()
    
    def discontinue(self, reason=None):
        """Discontinue the medication."""
        self.status = 'stopped'
        self.end_date = datetime.utcnow().date()
        if reason:
            self.notes = f"{self.notes}\nDiscontinued: {reason}" if self.notes else f"Discontinued: {reason}"
        self.updated_at = datetime.utcnow()
        db.session.commit()
