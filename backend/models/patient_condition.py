from datetime import datetime
from models import db


class PatientCondition(db.Model):
    """
    Patient Condition model.
    Stores chronic conditions and diagnoses following FHIR Condition resource.
    """
    __tablename__ = 'patient_conditions'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    patient_id = db.Column(
        db.Integer, 
        db.ForeignKey('patients.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    
    # Link to Condition catalog (optional)
    condition_id = db.Column(
        db.Integer,
        db.ForeignKey('conditions.id', ondelete='SET NULL'),
        nullable=True,
        index=True
    )
    
    # Condition Information
    condition_name = db.Column(db.String(255), nullable=False)  # Name of the condition
    condition_code = db.Column(db.String(50))  # ICD-10, SNOMED CT code
    condition_system = db.Column(db.String(100))  # Coding system used (e.g., ICD-10, SNOMED CT)
    
    # Clinical Status
    clinical_status = db.Column(db.String(20), nullable=False, default='active')  # active, recurrence, relapse, inactive, remission, resolved
    verification_status = db.Column(db.String(20), default='confirmed')  # unconfirmed, provisional, differential, confirmed, refuted, entered-in-error
    
    # Category
    category = db.Column(db.String(50))  # problem-list-item, encounter-diagnosis
    
    # Severity
    severity = db.Column(db.String(20))  # mild, moderate, severe
    
    # Dates
    onset_date = db.Column(db.Date)  # When the condition started
    recorded_date = db.Column(db.DateTime, default=datetime.utcnow)  # When this record was created
    abatement_date = db.Column(db.Date)  # When the condition resolved (if applicable)
    
    # Clinical Information
    body_site = db.Column(db.String(100))  # Anatomical location if applicable
    stage = db.Column(db.String(100))  # Stage/grade if applicable (e.g., cancer staging)
    
    # Recorder Information
    recorder_name = db.Column(db.String(200))  # Who recorded this condition
    recorder_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))  # Link to user if internal
    
    # Additional Information
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = db.relationship('Patient', backref=db.backref('conditions', lazy='dynamic', cascade='all, delete-orphan'))
    condition_catalog = db.relationship('Condition', backref='patient_conditions')
    recorder = db.relationship('User', foreign_keys=[recorder_id])
    
    def __repr__(self):
        return f'<PatientCondition {self.condition_name} for Patient {self.patient_id}>'
    
    @property
    def is_active(self):
        """Check if condition is currently active."""
        return self.clinical_status in ['active', 'recurrence', 'relapse']
    
    @property
    def duration_days(self):
        """Calculate duration of the condition in days."""
        if not self.onset_date:
            return None
        
        end_date = self.abatement_date if self.abatement_date else datetime.utcnow().date()
        return (end_date - self.onset_date).days
    
    def to_dict(self, include_recorder=False):
        """Convert model to dictionary for JSON serialization."""
        data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'condition_id': self.condition_id,
            'condition': {
                'name': self.condition_name,
                'code': self.condition_code,
                'system': self.condition_system
            },
            'clinical_status': self.clinical_status,
            'verification_status': self.verification_status,
            'category': self.category,
            'severity': self.severity,
            'is_active': self.is_active,
            'dates': {
                'onset': self.onset_date.isoformat() if self.onset_date else None,
                'recorded': self.recorded_date.isoformat() if self.recorded_date else None,
                'abatement': self.abatement_date.isoformat() if self.abatement_date else None,
                'duration_days': self.duration_days
            },
            'clinical_info': {
                'body_site': self.body_site,
                'stage': self.stage
            },
            'recorder_name': self.recorder_name,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Include catalog info if available
        if self.condition_catalog:
            data['catalog_info'] = {
                'id': self.condition_catalog.id,
                'name': self.condition_catalog.name,
                'category': self.condition_catalog.category,
                'icd10_code': self.condition_catalog.icd10_code,
                'snomed_code': self.condition_catalog.snomed_code,
                'is_chronic': self.condition_catalog.is_chronic
            }
        
        if include_recorder and self.recorder:
            data['recorder'] = {
                'id': self.recorder.id,
                'name': self.recorder.full_name,
                'email': self.recorder.email
            }
        
        return data
    
    @staticmethod
    def create(data):
        """Create a new patient condition."""
        condition = PatientCondition(
            patient_id=data['patient_id'],
            condition_id=data.get('condition_id'),  # Link to catalog if provided
            condition_name=data['condition_name'],
            condition_code=data.get('condition_code'),
            condition_system=data.get('condition_system'),
            clinical_status=data.get('clinical_status', 'active'),
            verification_status=data.get('verification_status', 'confirmed'),
            category=data.get('category'),
            severity=data.get('severity'),
            onset_date=data.get('onset_date'),
            recorded_date=data.get('recorded_date', datetime.utcnow()),
            abatement_date=data.get('abatement_date'),
            body_site=data.get('body_site'),
            stage=data.get('stage'),
            recorder_name=data.get('recorder_name'),
            recorder_id=data.get('recorder_id'),
            notes=data.get('notes')
        )
        
        db.session.add(condition)
        db.session.commit()
        
        return condition
    
    def update(self, data):
        """Update condition information."""
        if 'condition_id' in data:
            self.condition_id = data['condition_id']
        if 'condition_name' in data:
            self.condition_name = data['condition_name']
        if 'condition_code' in data:
            self.condition_code = data['condition_code']
        if 'condition_system' in data:
            self.condition_system = data['condition_system']
        if 'clinical_status' in data:
            self.clinical_status = data['clinical_status']
        if 'verification_status' in data:
            self.verification_status = data['verification_status']
        if 'category' in data:
            self.category = data['category']
        if 'severity' in data:
            self.severity = data['severity']
        if 'onset_date' in data:
            self.onset_date = data['onset_date']
        if 'abatement_date' in data:
            self.abatement_date = data['abatement_date']
        if 'body_site' in data:
            self.body_site = data['body_site']
        if 'stage' in data:
            self.stage = data['stage']
        if 'recorder_name' in data:
            self.recorder_name = data['recorder_name']
        if 'recorder_id' in data:
            self.recorder_id = data['recorder_id']
        if 'notes' in data:
            self.notes = data['notes']
        
        self.updated_at = datetime.utcnow()
        db.session.commit()
    
    def delete(self):
        """Delete the condition record."""
        db.session.delete(self)
        db.session.commit()
    
    def resolve(self, abatement_date=None, notes=None):
        """Mark the condition as resolved."""
        self.clinical_status = 'resolved'
        self.abatement_date = abatement_date or datetime.utcnow().date()
        if notes:
            self.notes = f"{self.notes}\n{notes}" if self.notes else notes
        self.updated_at = datetime.utcnow()
        db.session.commit()
