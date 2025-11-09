from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importar modelos
from models.organization import Organization

__all__ = ['db', 'Organization']
