"""
Seed Appointment Types
Creates default appointment types for the system.
Run this after creating tables: python seed_appointment_types.py
"""

from app import app, db
from models.appointment_type import AppointmentType


def seed_appointment_types():
    """Create default appointment types"""
    
    with app.app_context():
        print("🏥 Seeding Appointment Types...")
        
        # Use the create_defaults method from the model
        created = AppointmentType.create_defaults()
        
        if created:
            print(f"✅ Created {len(created)} appointment types:")
            for appointment_type in created:
                print(f"   - {appointment_type.name} ({appointment_type.default_duration} min)")
        else:
            print("ℹ️  All appointment types already exist")
        
        # Display all appointment types
        all_types = AppointmentType.get_active()
        print(f"\n📋 Total active appointment types: {len(all_types)}")
        
        print("\n✨ Appointment types seeding complete!")


if __name__ == '__main__':
    seed_appointment_types()
