"""
Migración: Agregar paleta de colores completa a organizaciones
Fecha: 2025-11-09
"""

from models import db
from models.organization import Organization

def upgrade():
    """Agregar columnas de paleta de colores"""
    # Usar raw SQL para agregar las columnas
    db.session.execute("""
        ALTER TABLE organizations 
        ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#10B981',
        ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7) DEFAULT '#F59E0B',
        ADD COLUMN IF NOT EXISTS success_color VARCHAR(7) DEFAULT '#10B981',
        ADD COLUMN IF NOT EXISTS warning_color VARCHAR(7) DEFAULT '#F59E0B',
        ADD COLUMN IF NOT EXISTS error_color VARCHAR(7) DEFAULT '#EF4444',
        ADD COLUMN IF NOT EXISTS info_color VARCHAR(7) DEFAULT '#3B82F6'
    """)
    db.session.commit()
    print("✅ Columnas de paleta de colores agregadas a organizations")

def downgrade():
    """Remover columnas de paleta de colores"""
    db.session.execute("""
        ALTER TABLE organizations 
        DROP COLUMN IF EXISTS secondary_color,
        DROP COLUMN IF EXISTS accent_color,
        DROP COLUMN IF EXISTS success_color,
        DROP COLUMN IF EXISTS warning_color,
        DROP COLUMN IF EXISTS error_color,
        DROP COLUMN IF EXISTS info_color
    """)
    db.session.commit()
    print("✅ Columnas de paleta de colores removidas de organizations")

if __name__ == '__main__':
    from app import app
    
    with app.app_context():
        print("Ejecutando migración: Agregar paleta de colores a organizaciones...")
        upgrade()
        print("Migración completada exitosamente!")
