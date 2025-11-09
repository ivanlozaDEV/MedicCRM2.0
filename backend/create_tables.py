"""
Script para crear las tablas de la base de datos.
Ejecutar: python create_tables.py
"""
from app import app, db
from models.organization import Organization

def create_all_tables():
    """Crea todas las tablas en la base de datos"""
    with app.app_context():
        print("🔧 Creando tablas en la base de datos...")
        
        # Crear todas las tablas
        db.create_all()
        
        print("✅ Tablas creadas exitosamente!")
        print("\nTablas disponibles:")
        print("  - organizations")
        
        # Verificar que la tabla existe
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        print(f"\n📊 Total de tablas en la BD: {len(tables)}")
        for table in tables:
            print(f"   ✓ {table}")

if __name__ == '__main__':
    create_all_tables()
