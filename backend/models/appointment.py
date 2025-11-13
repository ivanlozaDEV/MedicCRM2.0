from datetime import datetime
from models import db


class Appointment(db.Model):
    """
    Appointment model.
    Represents scheduled appointments between patients and healthcare providers.
    Based on FHIR R4 Appointment resource.
    ORGANIZATION-SCOPED - appointments belong to an organization.
    """
    __tablename__ = 'appointments'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    organization_id = db.Column(
        db.Integer,
        db.ForeignKey('organizations.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey('patients.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True,  # Main doctor/practitioner
        index=True
    )
    appointment_type_id = db.Column(
        db.Integer,
        db.ForeignKey('appointment_types.id', ondelete='SET NULL'),
        nullable=True,
        index=True
    )
    room_id = db.Column(
        db.Integer,
        db.ForeignKey('rooms.id', ondelete='SET NULL'),
        nullable=True,
        index=True
    )
    specialty_id = db.Column(
        db.Integer,
        db.ForeignKey('specialties.id', ondelete='SET NULL'),
        nullable=True,
        index=True
    )
    
    # FHIR Identifier
    fhir_id = db.Column(db.String(100), unique=True, index=True)  # FHIR identifier
    
    # Scheduling Information
    appointment_date = db.Column(db.Date, nullable=False, index=True)
    start_time = db.Column(db.Time, nullable=False, index=True)
    end_time = db.Column(db.Time, nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # Duration in minutes
    
    # Status (FHIR AppointmentStatus)
    # proposed | pending | booked | arrived | fulfilled | cancelled | noshow | entered-in-error | checked-in | waitlist
    status = db.Column(db.String(30), nullable=False, default='booked', index=True)
    
    # Priority (FHIR: routine | urgent | asap | stat)
    priority = db.Column(db.String(20), default='routine')
    
    # Service Category & Type (FHIR)
    service_category = db.Column(db.String(100))  # e.g., "General Practice", "Specialist"
    service_type = db.Column(db.String(100))  # e.g., "Consultation", "Follow-up"
    
    # Appointment Details
    reason = db.Column(db.String(500))  # Reason for appointment (patient's complaint)
    reason_code = db.Column(db.String(50))  # ICD-10 or SNOMED code
    
    # Patient Instructions
    patient_instructions = db.Column(db.Text)  # Instructions for patient (preparation, etc.)
    
    # Cancellation
    cancellation_reason = db.Column(db.String(500))
    cancelled_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    cancelled_at = db.Column(db.DateTime)
    
    # Check-in/Check-out
    checked_in_at = db.Column(db.DateTime)
    checked_out_at = db.Column(db.DateTime)
    arrival_time = db.Column(db.Time)  # Actual patient arrival time
    
    # Virtual Appointment
    is_virtual = db.Column(db.Boolean, default=False)
    virtual_link = db.Column(db.String(500))  # Video conference link
    
    # Reminders
    reminder_sent = db.Column(db.Boolean, default=False)
    reminder_sent_at = db.Column(db.DateTime)
    
    # Follow-up
    requires_follow_up = db.Column(db.Boolean, default=False)
    follow_up_date = db.Column(db.Date)
    follow_up_notes = db.Column(db.Text)
    
    # Additional Information
    notes = db.Column(db.Text)  # Internal notes (staff only)
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = db.relationship('Organization', backref=db.backref('appointments', lazy='dynamic'))
    patient = db.relationship('Patient', foreign_keys=[patient_id], backref=db.backref('appointments', lazy='dynamic'))
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref=db.backref('appointments_as_doctor', lazy='dynamic'))
    appointment_type = db.relationship('AppointmentType', backref=db.backref('appointments', lazy='dynamic'))
    room = db.relationship('Room', backref=db.backref('appointments', lazy='dynamic'))
    specialty = db.relationship('Specialty', backref=db.backref('appointments', lazy='dynamic'))
    cancelled_by = db.relationship('User', foreign_keys=[cancelled_by_user_id])
    created_by = db.relationship('User', foreign_keys=[created_by_user_id])
    
    def __repr__(self):
        return f'<Appointment {self.id} - {self.patient.full_name if self.patient else "Unknown"} on {self.appointment_date}>'
    
    @property
    def is_past(self):
        """Check if appointment is in the past"""
        from datetime import datetime, date, time as datetime_time
        
        now = datetime.now()
        appointment_datetime = datetime.combine(self.appointment_date, self.start_time)
        return appointment_datetime < now
    
    @property
    def is_today(self):
        """Check if appointment is today"""
        from datetime import date
        return self.appointment_date == date.today()
    
    @property
    def is_upcoming(self):
        """Check if appointment is upcoming (future)"""
        return not self.is_past
    
    @property
    def is_active(self):
        """Check if appointment is active (not cancelled or no-show)"""
        return self.status not in ['cancelled', 'noshow', 'entered-in-error']
    
    @property
    def is_completed(self):
        """Check if appointment is completed"""
        return self.status == 'fulfilled'
    
    @property
    def can_check_in(self):
        """Check if patient can check in"""
        return self.is_today and self.status == 'booked' and not self.checked_in_at
    
    @property
    def can_cancel(self):
        """Check if appointment can be cancelled"""
        return self.status in ['proposed', 'pending', 'booked', 'arrived', 'checked-in', 'waitlist'] and not self.is_past
    
    @property
    def time_range(self):
        """Returns formatted time range"""
        return f"{self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"
    
    def check_in(self):
        """Check in the patient"""
        if self.can_check_in:
            self.status = 'arrived'
            self.checked_in_at = datetime.utcnow()
            self.arrival_time = datetime.utcnow().time()
            return True
        return False
    
    def check_out(self):
        """Check out the patient"""
        if self.status == 'arrived':
            self.status = 'fulfilled'
            self.checked_out_at = datetime.utcnow()
            return True
        return False
    
    def cancel(self, reason, cancelled_by_user_id=None):
        """Cancel the appointment and release the slot"""
        if self.can_cancel:
            self.status = 'cancelled'
            self.cancellation_reason = reason
            self.cancelled_by_user_id = cancelled_by_user_id
            self.cancelled_at = datetime.utcnow()
            
            # Release the slot
            self.release_slot()
            
            return True
        return False
    
    def mark_no_show(self):
        """Mark appointment as no-show"""
        if self.is_past and self.status in ['booked', 'arrived', 'checked-in']:
            self.status = 'noshow'
            return True
        return False
    
    def sync_with_slot(self):
        """
        Synchronize appointment with its corresponding slot.
        Called after creating or updating an appointment.
        """
        from models.appointment_slot import AppointmentSlot
        
        # Find the corresponding slot
        slot = AppointmentSlot.query.filter_by(
            doctor_id=self.doctor_id,
            slot_date=self.appointment_date,
            start_time=self.start_time
        ).first()
        
        if slot:
            # Update slot status based on appointment status
            if self.status in ['cancelled', 'noshow', 'entered-in-error']:
                slot.release()
            else:
                slot.book(self.id)
            db.session.commit()
    
    def release_slot(self):
        """
        Release the slot when appointment is cancelled.
        """
        from models.appointment_slot import AppointmentSlot
        
        slot = AppointmentSlot.query.filter_by(appointment_id=self.id).first()
        if slot:
            slot.release()
            db.session.commit()
    
    def to_dict(self, include_patient=False, include_doctor=False, include_details=False):
        """
        Convert model to dictionary for JSON serialization.
        
        Args:
            include_patient (bool): Include patient details
            include_doctor (bool): Include doctor details
            include_details (bool): Include all related details (room, type, specialty)
            
        Returns:
            dict: Appointment data as dictionary
        """
        data = {
            'id': self.id,
            'organization_id': self.organization_id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'appointment_type_id': self.appointment_type_id,
            'room_id': self.room_id,
            'specialty_id': self.specialty_id,
            'fhir_id': self.fhir_id,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'time_range': self.time_range,
            'duration': self.duration,
            'status': self.status,
            'priority': self.priority,
            'service_category': self.service_category,
            'service_type': self.service_type,
            'reason': self.reason,
            'reason_code': self.reason_code,
            'patient_instructions': self.patient_instructions,
            'cancellation_reason': self.cancellation_reason,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'checked_in_at': self.checked_in_at.isoformat() if self.checked_in_at else None,
            'checked_out_at': self.checked_out_at.isoformat() if self.checked_out_at else None,
            'arrival_time': self.arrival_time.strftime('%H:%M') if self.arrival_time else None,
            'is_virtual': self.is_virtual,
            'virtual_link': self.virtual_link,
            'reminder_sent': self.reminder_sent,
            'reminder_sent_at': self.reminder_sent_at.isoformat() if self.reminder_sent_at else None,
            'requires_follow_up': self.requires_follow_up,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'follow_up_notes': self.follow_up_notes,
            'notes': self.notes,
            'is_past': self.is_past,
            'is_today': self.is_today,
            'is_upcoming': self.is_upcoming,
            'is_active': self.is_active,
            'is_completed': self.is_completed,
            'can_check_in': self.can_check_in,
            'can_cancel': self.can_cancel,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_patient and self.patient:
            data['patient'] = {
                'id': self.patient.id,
                'full_name': self.patient.full_name,
                'email': self.patient.email,
                'phone': self.patient.phone,
                'date_of_birth': self.patient.date_of_birth.isoformat() if self.patient.date_of_birth else None,
                'age': self.patient.age
            }
        
        if include_doctor and self.doctor:
            data['doctor'] = {
                'id': self.doctor.id,
                'full_name': self.doctor.full_name,
                'email': self.doctor.email,
                'medical_license': self.doctor.medical_license
            }
        
        if include_details:
            if self.appointment_type:
                data['appointment_type'] = {
                    'id': self.appointment_type.id,
                    'name': self.appointment_type.name,
                    'color': self.appointment_type.color,
                    'icon': self.appointment_type.icon
                }
            
            if self.room:
                data['room'] = {
                    'id': self.room.id,
                    'name': self.room.name,
                    'full_location': self.room.full_location
                }
            
            if self.specialty:
                data['specialty'] = {
                    'id': self.specialty.id,
                    'name': self.specialty.name,
                    'color': self.specialty.default_color
                }
        
        return data
    
    @staticmethod
    def get_by_organization(organization_id, start_date=None, end_date=None, status=None):
        """Get appointments for an organization with optional filters"""
        query = Appointment.query.filter_by(organization_id=organization_id)
        
        if start_date:
            query = query.filter(Appointment.appointment_date >= start_date)
        if end_date:
            query = query.filter(Appointment.appointment_date <= end_date)
        if status:
            query = query.filter_by(status=status)
        
        return query.order_by(Appointment.appointment_date, Appointment.start_time).all()
    
    @staticmethod
    def get_by_patient(patient_id, include_past=False):
        """Get all appointments for a patient"""
        from datetime import date
        
        query = Appointment.query.filter_by(patient_id=patient_id)
        
        if not include_past:
            query = query.filter(Appointment.appointment_date >= date.today())
        
        return query.order_by(Appointment.appointment_date, Appointment.start_time).all()
    
    @staticmethod
    def get_by_doctor(doctor_id, date_filter=None):
        """Get appointments for a specific doctor"""
        query = Appointment.query.filter_by(doctor_id=doctor_id)
        
        if date_filter:
            query = query.filter(Appointment.appointment_date == date_filter)
        
        return query.order_by(Appointment.appointment_date, Appointment.start_time).all()
    
    @staticmethod
    def get_today_appointments(organization_id):
        """Get all appointments for today"""
        from datetime import date
        return Appointment.query.filter_by(
            organization_id=organization_id,
            appointment_date=date.today()
        ).order_by(Appointment.start_time).all()
