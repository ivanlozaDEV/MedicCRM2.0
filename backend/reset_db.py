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
            db.drop_all()
            print("✅ All tables dropped successfully")
        except Exception as e:
            print(f"❌ Error dropping tables: {e}")
            return
        
        print("\n🔨 Creating all tables...")
        try:
            db.create_all()
            print("✅ All tables created successfully")
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
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
        print("\n✨ Database is now clean and ready to use!")
        print("=" * 60)

if __name__ == "__main__":
    reset_database()
