from datetime import datetime, date, time, timedelta
from models import db


class AppointmentSlot(db.Model):
    """
    Appointment Slot model.
    Pre-generated time slots based on doctor schedules.
    Used for faster availability checking and preventing double-booking.
    Based on FHIR R4 Slot resource.
    ORGANIZATION-SCOPED - slots are generated per organization.
    """
    __tablename__ = 'appointment_slots'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    schedule_id = db.Column(
        db.Integer,
        db.ForeignKey('doctor_schedules.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    organization_id = db.Column(
        db.Integer,
        db.ForeignKey('organizations.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    appointment_id = db.Column(
        db.Integer,
        db.ForeignKey('appointments.id', ondelete='SET NULL'),
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
    
    # Slot Information
    slot_date = db.Column(db.Date, nullable=False, index=True)
    start_time = db.Column(db.Time, nullable=False, index=True)
    end_time = db.Column(db.Time, nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # Duration in minutes
    
    # FHIR Status
    # free | busy | busy-unavailable | busy-tentative | entered-in-error
    status = db.Column(db.String(20), nullable=False, default='free', index=True)
    
    # Overbook support (for walk-ins or emergencies)
    is_overbooked = db.Column(db.Boolean, default=False)
    overbook_reason = db.Column(db.String(255))
    
    # Block/Reserve slots
    is_blocked = db.Column(db.Boolean, default=False)
    block_reason = db.Column(db.String(255))  # Meeting, Training, Emergency, etc.
    blocked_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    
    # Comments/Notes
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    schedule = db.relationship('DoctorSchedule', backref=db.backref('slots', lazy='dynamic'))
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref=db.backref('slots', lazy='dynamic'))
    organization = db.relationship('Organization', backref=db.backref('slots', lazy='dynamic'))
    appointment = db.relationship('Appointment', backref=db.backref('slot', uselist=False))
    room = db.relationship('Room', backref=db.backref('slots', lazy='dynamic'))
    specialty = db.relationship('Specialty', backref=db.backref('slots', lazy='dynamic'))
    blocked_by = db.relationship('User', foreign_keys=[blocked_by_user_id])
    
    # Unique constraint: one slot per doctor at a specific date/time
    __table_args__ = (
        db.UniqueConstraint('doctor_id', 'slot_date', 'start_time', name='uq_doctor_slot_datetime'),
        db.Index('idx_slot_search', 'organization_id', 'doctor_id', 'slot_date', 'status'),
    )
    
    def __repr__(self):
        return f'<AppointmentSlot {self.doctor.full_name if self.doctor else "Unknown"} on {self.slot_date} at {self.start_time}>'
    
    @property
    def is_available(self):
        """Check if slot is available for booking"""
        return self.status == 'free' and not self.is_blocked and not self.is_past
    
    @property
    def is_past(self):
        """Check if slot is in the past"""
        slot_datetime = datetime.combine(self.slot_date, self.start_time)
        return slot_datetime < datetime.now()
    
    @property
    def is_today(self):
        """Check if slot is today"""
        return self.slot_date == date.today()
    
    @property
    def time_range(self):
        """Returns formatted time range"""
        return f"{self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"
    
    @property
    def datetime_start(self):
        """Get datetime object for slot start"""
        return datetime.combine(self.slot_date, self.start_time)
    
    @property
    def datetime_end(self):
        """Get datetime object for slot end"""
        return datetime.combine(self.slot_date, self.end_time)
    
    def book(self, appointment_id):
        """
        Book this slot for an appointment.
        Returns True if successful, False if slot is not available.
        """
        if not self.is_available:
            return False
        
        self.appointment_id = appointment_id
        self.status = 'busy'
        return True
    
    def release(self):
        """
        Release this slot (e.g., when appointment is cancelled).
        Returns True if successful.
        """
        if self.status == 'busy' and self.appointment_id:
            self.appointment_id = None
            self.status = 'free'
            return True
        return False
    
    def block(self, reason, blocked_by_user_id=None):
        """
        Block this slot from being booked.
        Returns True if successful.
        """
        if self.is_available:
            self.is_blocked = True
            self.block_reason = reason
            self.blocked_by_user_id = blocked_by_user_id
            self.status = 'busy-unavailable'
            return True
        return False
    
    def unblock(self):
        """
        Unblock this slot.
        Returns True if successful.
        """
        if self.is_blocked:
            self.is_blocked = False
            self.block_reason = None
            self.blocked_by_user_id = None
            self.status = 'free'
            return True
        return False
    
    def to_dict(self, include_doctor=False, include_appointment=False):
        """
        Convert model to dictionary for JSON serialization.
        
        Args:
            include_doctor (bool): Include doctor details
            include_appointment (bool): Include appointment details
            
        Returns:
            dict: AppointmentSlot data as dictionary
        """
        data = {
            'id': self.id,
            'schedule_id': self.schedule_id,
            'doctor_id': self.doctor_id,
            'organization_id': self.organization_id,
            'appointment_id': self.appointment_id,
            'room_id': self.room_id,
            'specialty_id': self.specialty_id,
            'slot_date': self.slot_date.isoformat() if self.slot_date else None,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'time_range': self.time_range,
            'duration': self.duration,
            'status': self.status,
            'is_available': self.is_available,
            'is_overbooked': self.is_overbooked,
            'overbook_reason': self.overbook_reason,
            'is_blocked': self.is_blocked,
            'block_reason': self.block_reason,
            'notes': self.notes,
            'is_past': self.is_past,
            'is_today': self.is_today,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_doctor and self.doctor:
            data['doctor'] = {
                'id': self.doctor.id,
                'full_name': self.doctor.full_name,
                'email': self.doctor.email
            }
        
        if include_appointment and self.appointment:
            data['appointment'] = {
                'id': self.appointment.id,
                'patient_id': self.appointment.patient_id,
                'patient_name': self.appointment.patient.full_name if self.appointment.patient else None,
                'reason': self.appointment.reason,
                'status': self.appointment.status
            }
        
        if self.room:
            data['room'] = {
                'id': self.room.id,
                'name': self.room.name
            }
        
        if self.specialty:
            data['specialty'] = {
                'id': self.specialty.id,
                'name': self.specialty.name
            }
        
        return data
    
    @staticmethod
    def generate_slots_for_schedule(schedule, start_date, end_date):
        """
        Generate appointment slots based on a doctor schedule for a date range.
        
        Args:
            schedule: DoctorSchedule instance
            start_date: Start date for generating slots
            end_date: End date for generating slots
            
        Returns:
            list: Created AppointmentSlot instances
        """
        from datetime import timedelta
        
        if not schedule.is_active or not schedule.is_available:
            return []
        
        created_slots = []
        current_date = start_date
        
        while current_date <= end_date:
            # Check if this schedule applies to this date
            if current_date.weekday() == schedule.day_of_week:
                if schedule.is_effective_on_date(current_date):
                    # Check if slots already exist for this date
                    existing = AppointmentSlot.query.filter_by(
                        schedule_id=schedule.id,
                        doctor_id=schedule.user_id,
                        slot_date=current_date
                    ).first()
                    
                    if not existing:
                        # Generate slots for this day
                        day_slots = AppointmentSlot._generate_day_slots(schedule, current_date)
                        created_slots.extend(day_slots)
            
            current_date += timedelta(days=1)
        
        if created_slots:
            db.session.bulk_save_objects(created_slots)
            db.session.commit()
        
        return created_slots
    
    @staticmethod
    def _generate_day_slots(schedule, slot_date):
        """
        Generate all slots for a single day based on schedule.
        
        Args:
            schedule: DoctorSchedule instance
            slot_date: Date to generate slots for
            
        Returns:
            list: AppointmentSlot instances (not yet saved to DB)
        """
        slots = []
        
        # Create datetime objects for calculation
        current_time = datetime.combine(slot_date, schedule.start_time)
        end_datetime = datetime.combine(slot_date, schedule.end_time)
        
        # Break times
        break_start = datetime.combine(slot_date, schedule.break_start_time) if schedule.break_start_time else None
        break_end = datetime.combine(slot_date, schedule.break_end_time) if schedule.break_end_time else None
        
        slot_duration_minutes = schedule.slot_duration + schedule.buffer_time
        
        while current_time < end_datetime:
            slot_end = current_time + timedelta(minutes=schedule.slot_duration)
            
            # Skip if slot end is after working hours
            if slot_end > end_datetime:
                break
            
            # Skip if slot overlaps with break time
            if break_start and break_end:
                if not (slot_end <= break_start or current_time >= break_end):
                    # Slot overlaps with break, skip it
                    current_time += timedelta(minutes=slot_duration_minutes)
                    continue
            
            # Create slot
            slot = AppointmentSlot(
                schedule_id=schedule.id,
                doctor_id=schedule.user_id,
                organization_id=schedule.user.organization_id,
                room_id=schedule.room_id,
                specialty_id=schedule.specialty_id,
                slot_date=slot_date,
                start_time=current_time.time(),
                end_time=slot_end.time(),
                duration=schedule.slot_duration,
                status='free'
            )
            slots.append(slot)
            
            # Move to next slot
            current_time += timedelta(minutes=slot_duration_minutes)
        
        return slots
    
    @staticmethod
    def get_available_slots(doctor_id, start_date, end_date=None, organization_id=None):
        """
        Get all available slots for a doctor within a date range.
        
        Args:
            doctor_id: Doctor's user ID
            start_date: Start date
            end_date: End date (optional, defaults to start_date)
            organization_id: Organization ID (optional filter)
            
        Returns:
            list: Available AppointmentSlot instances
        """
        if end_date is None:
            end_date = start_date
        
        query = AppointmentSlot.query.filter(
            AppointmentSlot.doctor_id == doctor_id,
            AppointmentSlot.slot_date >= start_date,
            AppointmentSlot.slot_date <= end_date,
            AppointmentSlot.status == 'free',
            AppointmentSlot.is_blocked == False
        )
        
        if organization_id:
            query = query.filter_by(organization_id=organization_id)
        
        return query.order_by(AppointmentSlot.slot_date, AppointmentSlot.start_time).all()
    
    @staticmethod
    def get_slots_by_date(organization_id, slot_date, doctor_id=None, specialty_id=None):
        """
        Get all slots for a specific date with optional filters.
        
        Args:
            organization_id: Organization ID
            slot_date: Date to get slots for
            doctor_id: Optional doctor filter
            specialty_id: Optional specialty filter
            
        Returns:
            list: AppointmentSlot instances
        """
        query = AppointmentSlot.query.filter_by(
            organization_id=organization_id,
            slot_date=slot_date
        )
        
        if doctor_id:
            query = query.filter_by(doctor_id=doctor_id)
        if specialty_id:
            query = query.filter_by(specialty_id=specialty_id)
        
        return query.order_by(AppointmentSlot.start_time).all()
    
    @staticmethod
    def cleanup_past_slots(days_to_keep=30):
        """
        Delete old slots to prevent database bloat.
        Keep slots for the last N days for historical purposes.
        
        Args:
            days_to_keep: Number of days to keep (default 30)
            
        Returns:
            int: Number of deleted slots
        """
        cutoff_date = date.today() - timedelta(days=days_to_keep)
        
        deleted = AppointmentSlot.query.filter(
            AppointmentSlot.slot_date < cutoff_date
        ).delete()
        
        db.session.commit()
        return deleted
