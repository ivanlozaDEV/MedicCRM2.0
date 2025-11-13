"""
Condition catalog model.
Stores a catalog of common medical conditions with standardized codes.
"""

from datetime import datetime
from models import db


class Condition(db.Model):
    """
    Condition catalog model.
    Reference catalog of medical conditions with ICD-10 and SNOMED CT codes.
    Similar to Allergy and Medication catalogs.
    """
    __tablename__ = 'conditions'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Basic Information
    name = db.Column(db.String(255), nullable=False, unique=True, index=True)
    description = db.Column(db.Text)
    
    # Coding Systems
    icd10_code = db.Column(db.String(50), index=True)  # ICD-10 code
    snomed_code = db.Column(db.String(50), index=True)  # SNOMED CT code
    
    # Classification
    category = db.Column(db.String(50), index=True)  # cardiovascular, respiratory, etc.
    
    # Typical Characteristics
    typical_severity = db.Column(db.String(20))  # mild, moderate, severe
    is_chronic = db.Column(db.Boolean, default=True)  # chronic vs acute
    
    # Status
    is_active = db.Column(db.Boolean, default=True)  # Can be disabled if deprecated
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Condition {self.name}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'codes': {
                'icd10': self.icd10_code,
                'snomed': self.snomed_code
            },
            'category': self.category,
            'typical_severity': self.typical_severity,
            'is_chronic': self.is_chronic,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def search_by_name(query, limit=10):
        """Search conditions by name (case-insensitive)."""
        return Condition.query.filter(
            Condition.is_active == True,
            Condition.name.ilike(f'%{query}%')
        ).limit(limit).all()
    
    @staticmethod
    def get_by_category(category):
        """Get all conditions in a specific category."""
        return Condition.query.filter(
            Condition.is_active == True,
            Condition.category == category
        ).order_by(Condition.name).all()
    
    @staticmethod
    def get_all_categories():
        """Get all unique categories."""
        categories = db.session.query(Condition.category).distinct().all()
        return [cat[0] for cat in categories if cat[0]]
