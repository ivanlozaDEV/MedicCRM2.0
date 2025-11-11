#!/usr/bin/env python3
"""
Database Reset Script
Drops all tables and recreates them from SQLAlchemy models
WARNING: This will DELETE ALL DATA in the database!
"""

import sys
import os

# Add the parent directory to the path to import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models.organization import Organization
from models.user import User
from models.subscription import Subscription
from models.role import Role
from models.permission import Permission
from models.role_permission import RolePermission
from models.specialty import Specialty
from models.user_specialty import UserSpecialty
from models.user_role import UserRole
from models.patient import Patient
from models.patient_contact import PatientContact
from models.allergy import Allergy
from models.patient_allergy import PatientAllergy
from models.patient_medication import PatientMedication
from models.patient_condition import PatientCondition


def reset_database():
    """
    Drop all tables and recreate them
    """
    with app.app_context():
        print("=" * 60)
        print("DATABASE RESET SCRIPT")
        print("=" * 60)
        print("\n⚠️  WARNING: This will DELETE ALL DATA in the database!")
        print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}\n")
        
        # Ask for confirmation
        confirm = input("Are you sure you want to continue? (type 'yes' to confirm): ")
        
        if confirm.lower() != 'yes':
            print("\n❌ Operation cancelled.")
            return
        
        print("\n🗑️  Dropping all tables...")
        try:
            # Use raw SQL with CASCADE to drop all tables including dependencies
            db.session.execute(db.text('DROP SCHEMA public CASCADE'))
            db.session.execute(db.text('CREATE SCHEMA public'))
            db.session.commit()
            print("✅ All tables dropped successfully (CASCADE)")
        except Exception as e:
            print(f"❌ Error dropping tables: {e}")
            db.session.rollback()
            # Try the old way as fallback
            try:
                db.drop_all()
                print("✅ All tables dropped successfully (fallback)")
            except Exception as e2:
                print(f"❌ Error with fallback: {e2}")
                return
        
        print("\n🔨 Creating all tables...")
        try:
            db.create_all()
            print("✅ All tables created successfully")
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            return
        
        print("\n🌱 Seeding global permissions...")
        try:
            from seed_permissions import seed_permissions
            seed_permissions()
            print("✅ Permissions seeded successfully")
        except Exception as e:
            print(f"❌ Error seeding permissions: {e}")
            import traceback
            traceback.print_exc()
            return
        
        print("\n🌱 Seeding global specialties...")
        try:
            from seed_default_specialties import seed_default_specialties
            seed_default_specialties()
            print("✅ Specialties seeded successfully")
        except Exception as e:
            print(f"❌ Error seeding specialties: {e}")
            import traceback
            traceback.print_exc()
            return
        
        print("\n🌱 Seeding allergy catalog...")
        try:
            from seed_allergies import seed_allergies
            seed_allergies(auto_skip=True)
            print("✅ Allergies seeded successfully")
        except Exception as e:
            print(f"❌ Error seeding allergies: {e}")
            import traceback
            traceback.print_exc()
            return
        
        print("\n" + "=" * 60)
        print("✅ DATABASE RESET COMPLETE")
        print("=" * 60)
        print("\nTables created:")
        print("  - organizations")
        print("  - users")
        print("  - subscriptions")
        print("  - roles")
        print("  - permissions")
        print("  - role_permissions")
        print("  - specialties")
        print("  - user_specialties")
        print("  - user_roles")
        print("  - patients")
        print("  - patient_contacts")
        print("  - allergies (catalog)")
        print("  - patient_allergies")
        print("  - patient_medications")
        print("  - patient_conditions")
        
        print("\n📊 Seeded Data:")
        print(f"  - Permissions: {Permission.query.count()}")
        print(f"  - Specialties: {Specialty.query.count()}")
        print(f"  - Allergies (catalog): {Allergy.query.count()}")
        
        print("\n✨ Database is now clean and ready to use!")
        print("=" * 60)

if __name__ == "__main__":
    reset_database()
