"""
Generate Appointment Slots
Utility script to generate appointment slots based on doctor schedules.
Run this to pre-generate slots for better booking performance.

Usage:
    python generate_slots.py --days 30                    # Generate for next 30 days
    python generate_slots.py --doctor 5 --days 14         # Generate for specific doctor
    python generate_slots.py --from 2025-01-01 --to 2025-01-31  # Generate for date range
"""

from datetime import datetime, date, timedelta
from app import app, db
from models.appointment_slot import AppointmentSlot
from models.doctor_schedule import DoctorSchedule
from models.user import User
import argparse


def generate_slots(start_date=None, end_date=None, doctor_id=None, days=30):
    """
    Generate appointment slots based on doctor schedules.
    
    Args:
        start_date: Start date (defaults to today)
        end_date: End date (defaults to start_date + days)
        doctor_id: Optional doctor ID to generate slots for specific doctor
        days: Number of days to generate (default 30)
    """
    with app.app_context():
        # Set default dates
        if start_date is None:
            start_date = date.today()
        if end_date is None:
            end_date = start_date + timedelta(days=days)
        
        print(f"\n📅 Generating appointment slots...")
        print(f"   Date range: {start_date} to {end_date}")
        
        # Get schedules
        if doctor_id:
            schedules = DoctorSchedule.query.filter_by(
                user_id=doctor_id,
                is_active=True,
                is_available=True
            ).all()
            
            if not schedules:
                print(f"❌ No active schedules found for doctor ID {doctor_id}")
                return
            
            doctor = User.query.get(doctor_id)
            print(f"   Doctor: {doctor.full_name if doctor else 'Unknown'}")
        else:
            schedules = DoctorSchedule.query.filter_by(
                is_active=True,
                is_available=True
            ).all()
            
            if not schedules:
                print("❌ No active schedules found")
                return
            
            unique_doctors = set(s.user_id for s in schedules)
            print(f"   Doctors: {len(unique_doctors)} doctors with active schedules")
        
        print(f"   Schedules: {len(schedules)} active schedules found")
        print()
        
        total_slots = 0
        
        # Generate slots for each schedule
        for schedule in schedules:
            doctor = User.query.get(schedule.user_id)
            print(f"   Generating slots for {doctor.full_name} - {schedule.day_name} {schedule.time_range}...")
            
            created_slots = AppointmentSlot.generate_slots_for_schedule(
                schedule,
                start_date,
                end_date
            )
            
            if created_slots:
                print(f"   ✅ Created {len(created_slots)} slots")
                total_slots += len(created_slots)
            else:
                print(f"   ℹ️  No new slots created (may already exist)")
        
        print()
        print(f"✨ Slot generation complete!")
        print(f"   Total slots created: {total_slots}")
        print()


def cleanup_old_slots(days_to_keep=30):
    """
    Clean up old slots from the database.
    
    Args:
        days_to_keep: Number of days to keep (default 30)
    """
    with app.app_context():
        print(f"\n🧹 Cleaning up old appointment slots...")
        print(f"   Keeping slots from the last {days_to_keep} days")
        
        deleted_count = AppointmentSlot.cleanup_past_slots(days_to_keep)
        
        print(f"✅ Deleted {deleted_count} old slots")
        print()


def show_stats():
    """Show statistics about appointment slots"""
    with app.app_context():
        from sqlalchemy import func
        
        print("\n📊 Appointment Slots Statistics\n")
        
        # Total slots
        total = AppointmentSlot.query.count()
        print(f"   Total slots: {total}")
        
        # By status
        status_counts = db.session.query(
            AppointmentSlot.status,
            func.count(AppointmentSlot.id)
        ).group_by(AppointmentSlot.status).all()
        
        print("\n   By Status:")
        for status, count in status_counts:
            print(f"      {status}: {count}")
        
        # Available slots today
        today = date.today()
        available_today = AppointmentSlot.query.filter(
            AppointmentSlot.slot_date == today,
            AppointmentSlot.status == 'free',
            AppointmentSlot.is_blocked == False
        ).count()
        print(f"\n   Available slots today: {available_today}")
        
        # Upcoming available slots (next 7 days)
        next_week = today + timedelta(days=7)
        available_week = AppointmentSlot.query.filter(
            AppointmentSlot.slot_date >= today,
            AppointmentSlot.slot_date <= next_week,
            AppointmentSlot.status == 'free',
            AppointmentSlot.is_blocked == False
        ).count()
        print(f"   Available slots next 7 days: {available_week}")
        
        # By doctor
        print("\n   Top 5 Doctors by Total Slots:")
        doctor_counts = db.session.query(
            User.full_name,
            func.count(AppointmentSlot.id)
        ).join(
            AppointmentSlot, User.id == AppointmentSlot.doctor_id
        ).group_by(
            User.id, User.full_name
        ).order_by(
            func.count(AppointmentSlot.id).desc()
        ).limit(5).all()
        
        for doctor_name, count in doctor_counts:
            print(f"      {doctor_name}: {count} slots")
        
        print()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate appointment slots')
    parser.add_argument('--days', type=int, default=30, help='Number of days to generate slots for (default: 30)')
    parser.add_argument('--doctor', type=int, help='Doctor ID to generate slots for (optional)')
    parser.add_argument('--from', dest='from_date', type=str, help='Start date (YYYY-MM-DD)')
    parser.add_argument('--to', dest='to_date', type=str, help='End date (YYYY-MM-DD)')
    parser.add_argument('--cleanup', type=int, help='Clean up slots older than N days')
    parser.add_argument('--stats', action='store_true', help='Show slot statistics')
    
    args = parser.parse_args()
    
    if args.stats:
        show_stats()
    elif args.cleanup:
        cleanup_old_slots(args.cleanup)
    else:
        # Parse dates if provided
        start_date = None
        end_date = None
        
        if args.from_date:
            start_date = datetime.strptime(args.from_date, '%Y-%m-%d').date()
        
        if args.to_date:
            end_date = datetime.strptime(args.to_date, '%Y-%m-%d').date()
        
        generate_slots(
            start_date=start_date,
            end_date=end_date,
            doctor_id=args.doctor,
            days=args.days
        )
