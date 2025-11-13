"""
Doctor Schedule routes for DoctorCRM API.
Handles CRUD operations for doctor schedules/availability.
"""
from flask import Blueprint, request, jsonify
from models import db, DoctorSchedule
from datetime import datetime, time

doctor_schedules_bp = Blueprint('doctor_schedules', __name__, url_prefix='/api/doctor-schedules')


@doctor_schedules_bp.route('', methods=['GET'])
def get_all_schedules():
    """
    Get all doctor schedules.
    Query params: user_id, day_of_week, active_only, include_details
    """
    try:
        user_id = request.args.get('user_id', type=int)
        day_of_week = request.args.get('day_of_week', type=int)
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        include_user = request.args.get('include_user', 'false').lower() == 'true'
        include_specialty = request.args.get('include_specialty', 'false').lower() == 'true'
        include_room = request.args.get('include_room', 'false').lower() == 'true'
        
        query = DoctorSchedule.query
        
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        if day_of_week is not None:
            query = query.filter_by(day_of_week=day_of_week)
        
        if active_only:
            query = query.filter_by(is_active=True, is_available=True)
        
        schedules = query.order_by(DoctorSchedule.day_of_week, DoctorSchedule.start_time).all()
        
        return jsonify({
            'success': True,
            'data': [schedule.to_dict(
                include_user=include_user,
                include_specialty=include_specialty,
                include_room=include_room
            ) for schedule in schedules],
            'count': len(schedules)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@doctor_schedules_bp.route('/doctor/<int:user_id>', methods=['GET'])
def get_doctor_schedules(user_id):
    """Get all schedules for a specific doctor"""
    try:
        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
        
        schedules = DoctorSchedule.get_by_user(user_id, include_inactive=include_inactive)
        
        return jsonify({
            'success': True,
            'data': [schedule.to_dict(
                include_user=True,
                include_specialty=True,
                include_room=True
            ) for schedule in schedules],
            'count': len(schedules)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@doctor_schedules_bp.route('/doctor/<int:user_id>/day/<int:day_of_week>', methods=['GET'])
def get_doctor_day_schedules(user_id, day_of_week):
    """Get schedules for a specific doctor on a specific day"""
    try:
        if day_of_week < 0 or day_of_week > 6:
            return jsonify({
                'success': False,
                'error': 'day_of_week must be between 0 (Monday) and 6 (Sunday)'
            }), 400
        
        schedules = DoctorSchedule.get_by_day(user_id, day_of_week)
        
        return jsonify({
            'success': True,
            'data': [schedule.to_dict(
                include_user=True,
                include_specialty=True,
                include_room=True
            ) for schedule in schedules],
            'count': len(schedules)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@doctor_schedules_bp.route('/<int:schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    """Get a single schedule by ID"""
    try:
        schedule = DoctorSchedule.query.get(schedule_id)
        
        if not schedule:
            return jsonify({
                'success': False,
                'error': 'Schedule not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': schedule.to_dict(
                include_user=True,
                include_specialty=True,
                include_room=True
            )
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@doctor_schedules_bp.route('', methods=['POST'])
def create_schedule():
    """Create a new doctor schedule"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'day_of_week', 'start_time', 'end_time']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Validate day_of_week
        if data['day_of_week'] < 0 or data['day_of_week'] > 6:
            return jsonify({
                'success': False,
                'error': 'day_of_week must be between 0 (Monday) and 6 (Sunday)'
            }), 400
        
        # Parse time strings
        try:
            start_time = datetime.strptime(data['start_time'], '%H:%M').time()
            end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid time format. Use HH:MM (e.g., "09:00")'
            }), 400
        
        # Validate start_time < end_time
        if start_time >= end_time:
            return jsonify({
                'success': False,
                'error': 'start_time must be before end_time'
            }), 400
        
        # Parse break times if provided
        break_start_time = None
        break_end_time = None
        
        if 'break_start_time' in data and data['break_start_time']:
            try:
                break_start_time = datetime.strptime(data['break_start_time'], '%H:%M').time()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid break_start_time format. Use HH:MM'
                }), 400
        
        if 'break_end_time' in data and data['break_end_time']:
            try:
                break_end_time = datetime.strptime(data['break_end_time'], '%H:%M').time()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid break_end_time format. Use HH:MM'
                }), 400
        
        # Validate break times
        if break_start_time and break_end_time:
            if break_start_time >= break_end_time:
                return jsonify({
                    'success': False,
                    'error': 'break_start_time must be before break_end_time'
                }), 400
        
        # Parse dates if provided
        effective_from = None
        effective_until = None
        
        if 'effective_from' in data and data['effective_from']:
            effective_from = datetime.strptime(data['effective_from'], '%Y-%m-%d').date()
        
        if 'effective_until' in data and data['effective_until']:
            effective_until = datetime.strptime(data['effective_until'], '%Y-%m-%d').date()
        
        # Create new schedule
        schedule = DoctorSchedule(
            user_id=data['user_id'],
            specialty_id=data.get('specialty_id'),
            room_id=data.get('room_id'),
            name=data.get('name'),
            day_of_week=data['day_of_week'],
            start_time=start_time,
            end_time=end_time,
            break_start_time=break_start_time,
            break_end_time=break_end_time,
            slot_duration=data.get('slot_duration', 30),
            buffer_time=data.get('buffer_time', 0),
            effective_from=effective_from,
            effective_until=effective_until,
            max_appointments_per_slot=data.get('max_appointments_per_slot', 1),
            is_available=data.get('is_available', True),
            is_recurring=data.get('is_recurring', True),
            notes=data.get('notes'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(schedule)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Schedule created successfully',
            'data': schedule.to_dict(include_user=True, include_specialty=True, include_room=True)
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@doctor_schedules_bp.route('/<int:schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    """Update an existing doctor schedule"""
    try:
        schedule = DoctorSchedule.query.get(schedule_id)
        
        if not schedule:
            return jsonify({
                'success': False,
                'error': 'Schedule not found'
            }), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            schedule.name = data['name']
        if 'specialty_id' in data:
            schedule.specialty_id = data['specialty_id']
        if 'room_id' in data:
            schedule.room_id = data['room_id']
        if 'day_of_week' in data:
            if data['day_of_week'] < 0 or data['day_of_week'] > 6:
                return jsonify({
                    'success': False,
                    'error': 'day_of_week must be between 0 and 6'
                }), 400
            schedule.day_of_week = data['day_of_week']
        
        # Update times
        if 'start_time' in data:
            try:
                schedule.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid start_time format. Use HH:MM'
                }), 400
        
        if 'end_time' in data:
            try:
                schedule.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid end_time format. Use HH:MM'
                }), 400
        
        if 'break_start_time' in data:
            if data['break_start_time']:
                try:
                    schedule.break_start_time = datetime.strptime(data['break_start_time'], '%H:%M').time()
                except ValueError:
                    return jsonify({
                        'success': False,
                        'error': 'Invalid break_start_time format. Use HH:MM'
                    }), 400
            else:
                schedule.break_start_time = None
        
        if 'break_end_time' in data:
            if data['break_end_time']:
                try:
                    schedule.break_end_time = datetime.strptime(data['break_end_time'], '%H:%M').time()
                except ValueError:
                    return jsonify({
                        'success': False,
                        'error': 'Invalid break_end_time format. Use HH:MM'
                    }), 400
            else:
                schedule.break_end_time = None
        
        # Update other fields
        if 'slot_duration' in data:
            schedule.slot_duration = data['slot_duration']
        if 'buffer_time' in data:
            schedule.buffer_time = data['buffer_time']
        
        if 'effective_from' in data:
            if data['effective_from']:
                schedule.effective_from = datetime.strptime(data['effective_from'], '%Y-%m-%d').date()
            else:
                schedule.effective_from = None
        
        if 'effective_until' in data:
            if data['effective_until']:
                schedule.effective_until = datetime.strptime(data['effective_until'], '%Y-%m-%d').date()
            else:
                schedule.effective_until = None
        
        if 'max_appointments_per_slot' in data:
            schedule.max_appointments_per_slot = data['max_appointments_per_slot']
        if 'is_available' in data:
            schedule.is_available = data['is_available']
        if 'is_recurring' in data:
            schedule.is_recurring = data['is_recurring']
        if 'notes' in data:
            schedule.notes = data['notes']
        if 'is_active' in data:
            schedule.is_active = data['is_active']
        
        schedule.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Schedule updated successfully',
            'data': schedule.to_dict(include_user=True, include_specialty=True, include_room=True)
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@doctor_schedules_bp.route('/<int:schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    """Delete a doctor schedule"""
    try:
        schedule = DoctorSchedule.query.get(schedule_id)
        
        if not schedule:
            return jsonify({
                'success': False,
                'error': 'Schedule not found'
            }), 404
        
        # Note: Deleting schedule will cascade delete associated slots
        db.session.delete(schedule)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Schedule deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
