from datetime import datetime, time
from models import db


class DoctorSchedule(db.Model):
    """
    Doctor Schedule model.
    Defines the working hours and availability of doctors.
    Based on FHIR R4 Schedule resource.
    ORGANIZATION-SCOPED - schedules belong to users within an organization.
    """
    __tablename__ = 'doctor_schedules'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    specialty_id = db.Column(
        db.Integer,
        db.ForeignKey('specialties.id', ondelete='SET NULL'),
        nullable=True,  # Optional - schedule can be for a specific specialty
        index=True
    )
    room_id = db.Column(
        db.Integer,
        db.ForeignKey('rooms.id', ondelete='SET NULL'),
        nullable=True,  # Optional - default room for this schedule
        index=True
    )
    
    # Information
    name = db.Column(db.String(100))  # Optional name for the schedule (e.g., "Horario Matutino")
    
    # Day of Week (0 = Monday, 6 = Sunday)
    day_of_week = db.Column(db.Integer, nullable=False, index=True)  # 0-6
    
    # Time Slots
    start_time = db.Column(db.Time, nullable=False)  # Start time (e.g., 08:00)
    end_time = db.Column(db.Time, nullable=False)  # End time (e.g., 17:00)
    
    # Break Time (optional)
    break_start_time = db.Column(db.Time)  # Break start (e.g., 13:00)
    break_end_time = db.Column(db.Time)  # Break end (e.g., 14:00)
    
    # Slot Configuration
    slot_duration = db.Column(db.Integer, default=30, nullable=False)  # Duration of each appointment slot in minutes
    buffer_time = db.Column(db.Integer, default=0)  # Buffer time between appointments in minutes
    
    # Date Range (optional - for temporary schedules)
    effective_from = db.Column(db.Date)  # Start date for this schedule
    effective_until = db.Column(db.Date)  # End date for this schedule
    
    # Capacity
    max_appointments_per_slot = db.Column(db.Integer, default=1)  # Usually 1, but can be more for group sessions
    
    # Flags
    is_available = db.Column(db.Boolean, default=True)  # Is this schedule currently active?
    is_recurring = db.Column(db.Boolean, default=True)  # Does this schedule repeat weekly?
    
    # Notes
    notes = db.Column(db.Text)  # Additional notes about this schedule
    
    # Status
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('schedules', lazy='dynamic'))
    specialty = db.relationship('Specialty', backref=db.backref('schedules', lazy='dynamic'))
    room = db.relationship('Room', backref=db.backref('schedules', lazy='dynamic'))
    
    def __repr__(self):
        return f'<DoctorSchedule {self.user.full_name if self.user else "Unknown"} - {self.day_name}>'
    
    @property
    def day_name(self):
        """Returns the name of the day in Spanish"""
        days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        return days[self.day_of_week] if 0 <= self.day_of_week <= 6 else 'Unknown'
    
    @property
    def time_range(self):
        """Returns formatted time range"""
        return f"{self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"
    
    @property
    def has_break(self):
        """Check if this schedule has a break time"""
        return bool(self.break_start_time and self.break_end_time)
    
    @property
    def total_hours(self):
        """Calculate total working hours for this schedule"""
        from datetime import datetime, timedelta
        
        # Create datetime objects for calculation
        start = datetime.combine(datetime.today(), self.start_time)
        end = datetime.combine(datetime.today(), self.end_time)
        
        # Calculate total duration
        total_duration = (end - start).total_seconds() / 3600  # Convert to hours
        
        # Subtract break time if exists
        if self.has_break:
            break_start = datetime.combine(datetime.today(), self.break_start_time)
            break_end = datetime.combine(datetime.today(), self.break_end_time)
            break_duration = (break_end - break_start).total_seconds() / 3600
            total_duration -= break_duration
        
        return round(total_duration, 2)
    
    @property
    def available_slots(self):
        """Calculate number of available appointment slots"""
        total_minutes = self.total_hours * 60
        slot_with_buffer = self.slot_duration + self.buffer_time
        return int(total_minutes // slot_with_buffer)
    
    def is_effective_on_date(self, check_date):
        """Check if this schedule is effective on a given date"""
        if self.effective_from and check_date < self.effective_from:
            return False
        if self.effective_until and check_date > self.effective_until:
            return False
        return True
    
    def to_dict(self, include_user=False, include_specialty=False, include_room=False):
        """
        Convert model to dictionary for JSON serialization.
        
        Args:
            include_user (bool): Include user details
            include_specialty (bool): Include specialty details
            include_room (bool): Include room details
            
        Returns:
            dict: DoctorSchedule data as dictionary
        """
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'specialty_id': self.specialty_id,
            'room_id': self.room_id,
            'name': self.name,
            'day_of_week': self.day_of_week,
            'day_name': self.day_name,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'time_range': self.time_range,
            'break_start_time': self.break_start_time.strftime('%H:%M') if self.break_start_time else None,
            'break_end_time': self.break_end_time.strftime('%H:%M') if self.break_end_time else None,
            'has_break': self.has_break,
            'slot_duration': self.slot_duration,
            'buffer_time': self.buffer_time,
            'effective_from': self.effective_from.isoformat() if self.effective_from else None,
            'effective_until': self.effective_until.isoformat() if self.effective_until else None,
            'max_appointments_per_slot': self.max_appointments_per_slot,
            'is_available': self.is_available,
            'is_recurring': self.is_recurring,
            'notes': self.notes,
            'is_active': self.is_active,
            'total_hours': self.total_hours,
            'available_slots': self.available_slots,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'full_name': self.user.full_name,
                'email': self.user.email
            }
        
        if include_specialty and self.specialty:
            data['specialty'] = {
                'id': self.specialty.id,
                'name': self.specialty.name,
                'color': self.specialty.default_color
            }
        
        if include_room and self.room:
            data['room'] = {
                'id': self.room.id,
                'name': self.room.name,
                'full_location': self.room.full_location
            }
        
        return data
    
    @staticmethod
    def get_by_user(user_id, include_inactive=False):
        """Get all schedules for a specific user/doctor"""
        query = DoctorSchedule.query.filter_by(user_id=user_id)
        if not include_inactive:
            query = query.filter_by(is_active=True, is_available=True)
        return query.order_by(DoctorSchedule.day_of_week, DoctorSchedule.start_time).all()
    
    @staticmethod
    def get_by_day(user_id, day_of_week):
        """Get schedules for a specific user on a specific day"""
        return DoctorSchedule.query.filter_by(
            user_id=user_id,
            day_of_week=day_of_week,
            is_active=True,
            is_available=True
        ).order_by(DoctorSchedule.start_time).all()
