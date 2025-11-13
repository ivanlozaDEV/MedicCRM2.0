from datetime import datetime
from models import db


class AppointmentType(db.Model):
    """
    Appointment Type model.
    Catalog of appointment types (e.g., Consulta General, Seguimiento, Emergencia).
    Based on FHIR R4 AppointmentType CodeableConcept.
    GLOBAL - shared across all organizations (like Specialty).
    """
    __tablename__ = 'appointment_types'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Information
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    
    # FHIR Coding (optional for interoperability)
    code = db.Column(db.String(50))  # SNOMED CT or local coding system
    system = db.Column(db.String(255))  # Coding system URI (e.g., http://snomed.info/sct)
    
    # Configuration
    default_duration = db.Column(db.Integer, default=30, nullable=False)  # Duration in minutes
    color = db.Column(db.String(7), default='#3B82F6')  # Hex color for calendar display
    icon = db.Column(db.String(50), default='calendar')  # Icon identifier for UI
    
    # Flags
    requires_preparation = db.Column(db.Boolean, default=False)  # e.g., fasting required
    preparation_instructions = db.Column(db.Text)  # Instructions for patient preparation
    is_virtual = db.Column(db.Boolean, default=False)  # Telemedicine appointment
    
    # Status
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<AppointmentType {self.name}>'
    
    @property
    def appointment_count(self):
        """Get count of appointments of this type"""
        from models.appointment import Appointment
        return Appointment.query.filter_by(appointment_type_id=self.id).count()
    
    def to_dict(self, include_stats=False):
        """
        Convert model to dictionary for JSON serialization.
        
        Args:
            include_stats (bool): Include statistics like appointment count
            
        Returns:
            dict: AppointmentType data as dictionary
        """
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'code': self.code,
            'system': self.system,
            'default_duration': self.default_duration,
            'color': self.color,
            'icon': self.icon,
            'requires_preparation': self.requires_preparation,
            'preparation_instructions': self.preparation_instructions,
            'is_virtual': self.is_virtual,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_stats:
            data['appointment_count'] = self.appointment_count
        
        return data
    
    @staticmethod
    def get_active():
        """Get all active appointment types"""
        return AppointmentType.query.filter_by(is_active=True).order_by(AppointmentType.name).all()
    
    @staticmethod
    def create_defaults():
        """
        Create default appointment types for new organizations.
        This should be called during database seeding.
        """
        default_types = [
            {
                'name': 'Consulta General',
                'description': 'Consulta médica general',
                'default_duration': 30,
                'color': '#3B82F6',
                'icon': 'user-circle'
            },
            {
                'name': 'Consulta de Seguimiento',
                'description': 'Consulta de control o seguimiento',
                'default_duration': 20,
                'color': '#10B981',
                'icon': 'clipboard-check'
            },
            {
                'name': 'Primera Consulta',
                'description': 'Primera vez del paciente',
                'default_duration': 45,
                'color': '#8B5CF6',
                'icon': 'user-plus'
            },
            {
                'name': 'Urgencia',
                'description': 'Consulta de urgencia',
                'default_duration': 15,
                'color': '#EF4444',
                'icon': 'exclamation-circle'
            },
            {
                'name': 'Procedimiento',
                'description': 'Procedimiento médico',
                'default_duration': 60,
                'color': '#F59E0B',
                'icon': 'beaker'
            },
            {
                'name': 'Teleconsulta',
                'description': 'Consulta virtual',
                'default_duration': 20,
                'color': '#06B6D4',
                'icon': 'video-camera',
                'is_virtual': True
            },
            {
                'name': 'Examen Médico',
                'description': 'Examen o chequeo médico',
                'default_duration': 30,
                'color': '#EC4899',
                'icon': 'document-text',
                'requires_preparation': True,
                'preparation_instructions': 'Acudir en ayunas de 8 horas'
            }
        ]
        
        created = []
        for type_data in default_types:
            existing = AppointmentType.query.filter_by(name=type_data['name']).first()
            if not existing:
                appointment_type = AppointmentType(**type_data)
                db.session.add(appointment_type)
                created.append(appointment_type)
        
        if created:
            db.session.commit()
        
        return created
