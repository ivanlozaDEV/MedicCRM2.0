from datetime import datetime
from models import db


class Organization(db.Model):
    """
    Modelo para organizaciones/clínicas.
    Representa las diferentes instituciones médicas que usan el sistema.
    """
    __tablename__ = 'organizations'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Información básica
    name = db.Column(db.String(200), nullable=False, index=True)
    slug = db.Column(db.String(100), unique=True, nullable=False, index=True)
    # slug es usado para URLs: mediccrm.com/{slug}/dashboard
    legal_name = db.Column(db.String(200))
    tax_id = db.Column(db.String(50), unique=True)
    
    # Contacto
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    website = db.Column(db.String(255))
    
    # Dirección
    address_line1 = db.Column(db.String(255))
    address_line2 = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    postal_code = db.Column(db.String(20))
    country = db.Column(db.String(100), default='Ecuador')
    
    # Configuración
    timezone = db.Column(db.String(50), default='America/Guayaquil')
    currency = db.Column(db.String(3), default='USD')
    
    # Branding
    logo_url = db.Column(db.String(255))
    primary_color = db.Column(db.String(7), default='#4F46E5')
    
    # Estado
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Organization {self.name}>'
    
    def to_dict(self):
        """Convierte el modelo a diccionario para JSON"""
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'legal_name': self.legal_name,
            'tax_id': self.tax_id,
            'email': self.email,
            'phone': self.phone,
            'website': self.website,
            'address': {
                'line1': self.address_line1,
                'line2': self.address_line2,
                'city': self.city,
                'state': self.state,
                'postal_code': self.postal_code,
                'country': self.country
            },
            'configuration': {
                'timezone': self.timezone,
                'currency': self.currency
            },
            'branding': {
                'logo_url': self.logo_url,
                'primary_color': self.primary_color
            },
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def create(cls, **kwargs):
        """Método helper para crear una organización"""
        organization = cls(**kwargs)
        db.session.add(organization)
        db.session.commit()
        return organization
    
    def update(self, **kwargs):
        """Método helper para actualizar una organización"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def delete(self):
        """Soft delete - marca como inactiva"""
        self.is_active = False
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def hard_delete(self):
        """Hard delete - elimina permanentemente"""
        db.session.delete(self)
        db.session.commit()
