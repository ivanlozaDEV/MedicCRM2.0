"""
Appointment Slot routes for DoctorCRM API.
Handles operations for appointment slots (availability checking, blocking, etc.)
"""
from flask import Blueprint, request, jsonify
from models import db, AppointmentSlot, DoctorSchedule
from datetime import datetime, date, timedelta

appointment_slots_bp = Blueprint('appointment_slots', __name__, url_prefix='/api/appointment-slots')


@appointment_slots_bp.route('/available', methods=['GET'])
def get_available_slots():
    """
    Get available appointment slots.
    Query params: doctor_id (required), start_date (required), end_date, organization_id
    """
    try:
        doctor_id = request.args.get('doctor_id', type=int)
        organization_id = request.args.get('organization_id', type=int)
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if not doctor_id or not start_date_str:
            return jsonify({
                'success': False,
                'error': 'doctor_id and start_date are required'
            }), 400
        
        # Parse dates
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid start_date format. Use YYYY-MM-DD'
            }), 400
        
        end_date = start_date  # Default to same day
        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid end_date format. Use YYYY-MM-DD'
                }), 400
        
        slots = AppointmentSlot.get_available_slots(
            doctor_id=doctor_id,
            start_date=start_date,
            end_date=end_date,
            organization_id=organization_id
        )
        
        return jsonify({
            'success': True,
            'data': [slot.to_dict(include_doctor=True) for slot in slots],
            'count': len(slots)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointment_slots_bp.route('/by-date', methods=['GET'])
def get_slots_by_date():
    """
    Get all slots for a specific date.
    Query params: organization_id (required), slot_date (required), doctor_id, specialty_id
    """
    try:
        organization_id = request.args.get('organization_id', type=int)
        slot_date_str = request.args.get('slot_date')
        doctor_id = request.args.get('doctor_id', type=int)
        specialty_id = request.args.get('specialty_id', type=int)
        
        if not organization_id or not slot_date_str:
            return jsonify({
                'success': False,
                'error': 'organization_id and slot_date are required'
            }), 400
        
        # Parse date
        try:
            slot_date = datetime.strptime(slot_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid slot_date format. Use YYYY-MM-DD'
            }), 400
        
        slots = AppointmentSlot.get_slots_by_date(
            organization_id=organization_id,
            slot_date=slot_date,
            doctor_id=doctor_id,
            specialty_id=specialty_id
        )
        
        return jsonify({
            'success': True,
            'data': [slot.to_dict(include_doctor=True, include_appointment=True) for slot in slots],
            'count': len(slots)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointment_slots_bp.route('/<int:slot_id>', methods=['GET'])
def get_slot(slot_id):
    """Get a single slot by ID"""
    try:
        slot = AppointmentSlot.query.get(slot_id)
        
        if not slot:
            return jsonify({
                'success': False,
                'error': 'Slot not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': slot.to_dict(include_doctor=True, include_appointment=True)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointment_slots_bp.route('/generate', methods=['POST'])
def generate_slots():
    """
    Generate slots for a schedule.
    Body: schedule_id (required), start_date (required), end_date (required)
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['schedule_id', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Get schedule
        schedule = DoctorSchedule.query.get(data['schedule_id'])
        if not schedule:
            return jsonify({
                'success': False,
                'error': 'Schedule not found'
            }), 404
        
        # Parse dates
        try:
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }), 400
        
        # Generate slots
        created_slots = AppointmentSlot.generate_slots_for_schedule(
            schedule=schedule,
            start_date=start_date,
            end_date=end_date
        )
        
        return jsonify({
            'success': True,
            'message': f'Generated {len(created_slots)} slots',
            'count': len(created_slots)
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointment_slots_bp.route('/<int:slot_id>/block', methods=['POST'])
def block_slot(slot_id):
    """Block a slot from being booked"""
    try:
        slot = AppointmentSlot.query.get(slot_id)
        
        if not slot:
            return jsonify({
                'success': False,
                'error': 'Slot not found'
            }), 404
        
        data = request.get_json()
        
        if not data or 'reason' not in data:
            return jsonify({
                'success': False,
                'error': 'Block reason is required'
            }), 400
        
        success = slot.block(
            reason=data['reason'],
            blocked_by_user_id=data.get('blocked_by_user_id')
        )
        
        if success:
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Slot blocked successfully',
                'data': slot.to_dict()
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Cannot block this slot (not available)'
            }), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointment_slots_bp.route('/<int:slot_id>/unblock', methods=['POST'])
def unblock_slot(slot_id):
    """Unblock a previously blocked slot"""
    try:
        slot = AppointmentSlot.query.get(slot_id)
        
        if not slot:
            return jsonify({
                'success': False,
                'error': 'Slot not found'
            }), 404
        
        success = slot.unblock()
        
        if success:
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Slot unblocked successfully',
                'data': slot.to_dict()
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Cannot unblock this slot (not blocked)'
            }), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointment_slots_bp.route('/block-range', methods=['POST'])
def block_slot_range():
    """
    Block multiple slots in a time range.
    Body: doctor_id, start_date, end_date, start_time, end_time, reason
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['doctor_id', 'start_date', 'start_time', 'end_time', 'reason']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Parse dates and times
        try:
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            start_time = datetime.strptime(data['start_time'], '%H:%M').time()
            end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time'
            }), 400
        
        end_date = start_date
        if 'end_date' in data:
            try:
                end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid end_date format. Use YYYY-MM-DD'
                }), 400
        
        # Find slots in range
        slots = AppointmentSlot.query.filter(
            AppointmentSlot.doctor_id == data['doctor_id'],
            AppointmentSlot.slot_date >= start_date,
            AppointmentSlot.slot_date <= end_date,
            AppointmentSlot.start_time >= start_time,
            AppointmentSlot.start_time < end_time,
            AppointmentSlot.status == 'free'
        ).all()
        
        blocked_count = 0
        for slot in slots:
            if slot.block(reason=data['reason'], blocked_by_user_id=data.get('blocked_by_user_id')):
                blocked_count += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Blocked {blocked_count} slots',
            'count': blocked_count
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointment_slots_bp.route('/cleanup', methods=['POST'])
def cleanup_old_slots():
    """
    Clean up old slots.
    Body: days_to_keep (optional, default 30)
    """
    try:
        data = request.get_json() or {}
        days_to_keep = data.get('days_to_keep', 30)
        
        deleted_count = AppointmentSlot.cleanup_past_slots(days_to_keep=days_to_keep)
        
        return jsonify({
            'success': True,
            'message': f'Deleted {deleted_count} old slots',
            'count': deleted_count
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
