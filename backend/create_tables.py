"""
Script to create database tables.
Run: python create_tables.py
"""
from app import app, db
from models.organization import Organization
from models.user import User
from models.subscription import Subscription

def create_all_tables():
    """Create all tables in the database"""
    with app.app_context():
        print("🔧 Creating tables in database...")
        
        # Create all tables
        db.create_all()
        
        print("✅ Tables created successfully!")
        print("\nAvailable tables:")
        print("  - organizations")
        print("  - users")
        print("  - subscriptions")
        
        # Verify tables exist
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        print(f"\n📊 Total tables in DB: {len(tables)}")
        for table in tables:
            print(f"   ✓ {table}")

if __name__ == '__main__':
    create_all_tables()
