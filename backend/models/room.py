from datetime import datetime
from models import db


class Room(db.Model):
    """
    Room/Location model.
    Represents physical or virtual rooms/offices where appointments take place.
    Based on FHIR R4 Location resource.
    ORGANIZATION-SCOPED - each room belongs to an organization.
    """
    __tablename__ = 'rooms'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    organization_id = db.Column(
        db.Integer,
        db.ForeignKey('organizations.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    
    # Information
    name = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text)
    
    # FHIR Coding
    identifier = db.Column(db.String(50))  # Internal room identifier (e.g., "ROOM-101")
    
    # Room Type
    room_type = db.Column(db.String(50), default='examination')  
    # Types: examination, operating, emergency, virtual, office, laboratory, imaging
    
    # Location Details
    floor = db.Column(db.String(20))  # Floor number or name
    building = db.Column(db.String(100))  # Building name or identifier
    
    # Physical Characteristics
    capacity = db.Column(db.Integer, default=1)  # Number of people the room can accommodate
    has_equipment = db.Column(db.Boolean, default=False)  # Has special medical equipment
    equipment_list = db.Column(db.Text)  # List of available equipment (JSON or text)
    
    # Accessibility
    is_accessible = db.Column(db.Boolean, default=True)  # Wheelchair accessible
    accessibility_notes = db.Column(db.Text)
    
    # Virtual Room (for telemedicine)
    is_virtual = db.Column(db.Boolean, default=False)
    virtual_link_template = db.Column(db.String(255))  # Template for video conference link
    
    # Availability
    is_available = db.Column(db.Boolean, default=True)
    availability_notes = db.Column(db.Text)  # Notes about availability restrictions
    
    # Status
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = db.relationship('Organization', backref=db.backref('rooms', lazy='dynamic'))
    
    # Add unique constraint: room name must be unique within an organization
    __table_args__ = (
        db.UniqueConstraint('organization_id', 'name', name='uq_room_org_name'),
    )
    
    def __repr__(self):
        return f'<Room {self.name}>'
    
    @property
    def full_location(self):
        """Returns full location string"""
        parts = []
        if self.building:
            parts.append(self.building)
        if self.floor:
            parts.append(f"Piso {self.floor}")
        parts.append(self.name)
        return " - ".join(parts)
    
    @property
    def appointment_count(self):
        """Get count of appointments in this room"""
        from models.appointment import Appointment
        return Appointment.query.filter_by(room_id=self.id).count()
    
    def to_dict(self, include_organization=False, include_stats=False):
        """
        Convert model to dictionary for JSON serialization.
        
        Args:
            include_organization (bool): Include organization details
            include_stats (bool): Include statistics like appointment count
            
        Returns:
            dict: Room data as dictionary
        """
        data = {
            'id': self.id,
            'organization_id': self.organization_id,
            'name': self.name,
            'description': self.description,
            'identifier': self.identifier,
            'room_type': self.room_type,
            'floor': self.floor,
            'building': self.building,
            'full_location': self.full_location,
            'capacity': self.capacity,
            'has_equipment': self.has_equipment,
            'equipment_list': self.equipment_list,
            'is_accessible': self.is_accessible,
            'accessibility_notes': self.accessibility_notes,
            'is_virtual': self.is_virtual,
            'virtual_link_template': self.virtual_link_template,
            'is_available': self.is_available,
            'availability_notes': self.availability_notes,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_organization and self.organization:
            data['organization'] = {
                'id': self.organization.id,
                'name': self.organization.name,
                'slug': self.organization.slug
            }
        
        if include_stats:
            data['appointment_count'] = self.appointment_count
        
        return data
    
    @staticmethod
    def get_by_organization(organization_id, include_inactive=False):
        """Get all rooms for a specific organization"""
        query = Room.query.filter_by(organization_id=organization_id)
        if not include_inactive:
            query = query.filter_by(is_active=True)
        return query.order_by(Room.name).all()
    
    @staticmethod
    def get_available(organization_id):
        """Get all available and active rooms for an organization"""
        return Room.query.filter_by(
            organization_id=organization_id,
            is_active=True,
            is_available=True
        ).order_by(Room.name).all()
