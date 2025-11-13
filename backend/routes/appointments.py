"""
Appointment routes for DoctorCRM API.
Handles CRUD operations for appointments.
"""
from flask import Blueprint, request, jsonify
from models import db, Appointment, AppointmentSlot
from datetime import datetime, date, time
import uuid

appointments_bp = Blueprint('appointments', __name__, url_prefix='/api/appointments')


@appointments_bp.route('', methods=['GET'])
def get_all_appointments():
    """
    Get all appointments.
    Query params: organization_id (required), patient_id, doctor_id, 
                  start_date, end_date, status, include_details
    """
    try:
        organization_id = request.args.get('organization_id', type=int)
        
        if not organization_id:
            return jsonify({
                'success': False,
                'error': 'organization_id is required'
            }), 400
        
        patient_id = request.args.get('patient_id', type=int)
        doctor_id = request.args.get('doctor_id', type=int)
        status = request.args.get('status')
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        include_patient = request.args.get('include_patient', 'false').lower() == 'true'
        include_doctor = request.args.get('include_doctor', 'false').lower() == 'true'
        include_details = request.args.get('include_details', 'false').lower() == 'true'
        
        # Parse dates
        start_date = None
        end_date = None
        
        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid start_date format. Use YYYY-MM-DD'
                }), 400
        
        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid end_date format. Use YYYY-MM-DD'
                }), 400
        
        # Get appointments
        appointments = Appointment.get_by_organization(
            organization_id=organization_id,
            start_date=start_date,
            end_date=end_date,
            status=status
        )
        
        # Filter by patient_id or doctor_id if provided
        if patient_id:
            appointments = [apt for apt in appointments if apt.patient_id == patient_id]
        
        if doctor_id:
            appointments = [apt for apt in appointments if apt.doctor_id == doctor_id]
        
        return jsonify({
            'success': True,
            'data': [apt.to_dict(
                include_patient=include_patient,
                include_doctor=include_doctor,
                include_details=include_details
            ) for apt in appointments],
            'count': len(appointments)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointments_bp.route('/today', methods=['GET'])
def get_today_appointments():
    """Get all appointments for today"""
    try:
        organization_id = request.args.get('organization_id', type=int)
        
        if not organization_id:
            return jsonify({
                'success': False,
                'error': 'organization_id is required'
            }), 400
        
        appointments = Appointment.get_today_appointments(organization_id)
        
        return jsonify({
            'success': True,
            'data': [apt.to_dict(
                include_patient=True,
                include_doctor=True,
                include_details=True
            ) for apt in appointments],
            'count': len(appointments)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointments_bp.route('/patient/<int:patient_id>', methods=['GET'])
def get_patient_appointments(patient_id):
    """Get all appointments for a specific patient"""
    try:
        include_past = request.args.get('include_past', 'false').lower() == 'true'
        
        appointments = Appointment.get_by_patient(patient_id, include_past=include_past)
        
        return jsonify({
            'success': True,
            'data': [apt.to_dict(
                include_patient=False,
                include_doctor=True,
                include_details=True
            ) for apt in appointments],
            'count': len(appointments)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointments_bp.route('/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor_appointments(doctor_id):
    """Get all appointments for a specific doctor"""
    try:
        date_str = request.args.get('date')
        date_filter = None
        
        if date_str:
            try:
                date_filter = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid date format. Use YYYY-MM-DD'
                }), 400
        
        appointments = Appointment.get_by_doctor(doctor_id, date_filter=date_filter)
        
        return jsonify({
            'success': True,
            'data': [apt.to_dict(
                include_patient=True,
                include_doctor=False,
                include_details=True
            ) for apt in appointments],
            'count': len(appointments)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointments_bp.route('/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    """Get a single appointment by ID"""
    try:
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment:
            return jsonify({
                'success': False,
                'error': 'Appointment not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': appointment.to_dict(
                include_patient=True,
                include_doctor=True,
                include_details=True
            )
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointments_bp.route('', methods=['POST'])
def create_appointment():
    """Create a new appointment"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['organization_id', 'patient_id', 'doctor_id', 
                          'appointment_date', 'start_time', 'duration']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Parse date and time
        try:
            appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
            start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time'
            }), 400
        
        # Calculate end_time
        from datetime import timedelta
        start_datetime = datetime.combine(appointment_date, start_time)
        end_datetime = start_datetime + timedelta(minutes=data['duration'])
        end_time = end_datetime.time()
        
        # Check if slot is available (if using slot system)
        slot = AppointmentSlot.query.filter_by(
            doctor_id=data['doctor_id'],
            slot_date=appointment_date,
            start_time=start_time
        ).first()
        
        if slot and not slot.is_available:
            return jsonify({
                'success': False,
                'error': 'This time slot is not available'
            }), 409
        
        # Generate FHIR ID
        fhir_id = str(uuid.uuid4())
        
        # Create appointment
        appointment = Appointment(
            organization_id=data['organization_id'],
            patient_id=data['patient_id'],
            doctor_id=data['doctor_id'],
            appointment_type_id=data.get('appointment_type_id'),
            room_id=data.get('room_id'),
            specialty_id=data.get('specialty_id'),
            fhir_id=fhir_id,
            appointment_date=appointment_date,
            start_time=start_time,
            end_time=end_time,
            duration=data['duration'],
            status=data.get('status', 'booked'),
            priority=data.get('priority', 'routine'),
            service_category=data.get('service_category'),
            service_type=data.get('service_type'),
            reason=data.get('reason'),
            reason_code=data.get('reason_code'),
            patient_instructions=data.get('patient_instructions'),
            is_virtual=data.get('is_virtual', False),
            virtual_link=data.get('virtual_link'),
            requires_follow_up=data.get('requires_follow_up', False),
            notes=data.get('notes'),
            created_by_user_id=data.get('created_by_user_id')
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        # Sync with slot
        appointment.sync_with_slot()
        
        return jsonify({
            'success': True,
            'message': 'Appointment created successfully',
            'data': appointment.to_dict(
                include_patient=True,
                include_doctor=True,
                include_details=True
            )
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointments_bp.route('/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    """Update an existing appointment"""
    try:
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment:
            return jsonify({
                'success': False,
                'error': 'Appointment not found'
            }), 404
        
        data = request.get_json()
        
        # Update simple fields
        if 'appointment_type_id' in data:
            appointment.appointment_type_id = data['appointment_type_id']
        if 'room_id' in data:
            appointment.room_id = data['room_id']
        if 'specialty_id' in data:
            appointment.specialty_id = data['specialty_id']
        if 'priority' in data:
            appointment.priority = data['priority']
        if 'service_category' in data:
            appointment.service_category = data['service_category']
        if 'service_type' in data:
            appointment.service_type = data['service_type']
        if 'reason' in data:
            appointment.reason = data['reason']
        if 'reason_code' in data:
            appointment.reason_code = data['reason_code']
        if 'patient_instructions' in data:
            appointment.patient_instructions = data['patient_instructions']
        if 'is_virtual' in data:
            appointment.is_virtual = data['is_virtual']
        if 'virtual_link' in data:
            appointment.virtual_link = data['virtual_link']
        if 'requires_follow_up' in data:
            appointment.requires_follow_up = data['requires_follow_up']
        if 'notes' in data:
            appointment.notes = data['notes']
        
        # Handle rescheduling (date/time change)
        if 'appointment_date' in data or 'start_time' in data or 'duration' in data:
            # Release old slot
            appointment.release_slot()
            
            if 'appointment_date' in data:
                try:
                    appointment.appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({
                        'success': False,
                        'error': 'Invalid appointment_date format. Use YYYY-MM-DD'
                    }), 400
            
            if 'start_time' in data:
                try:
                    appointment.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
                except ValueError:
                    return jsonify({
                        'success': False,
                        'error': 'Invalid start_time format. Use HH:MM'
                    }), 400
            
            if 'duration' in data:
                appointment.duration = data['duration']
            
            # Recalculate end_time
            from datetime import timedelta
            start_datetime = datetime.combine(appointment.appointment_date, appointment.start_time)
            end_datetime = start_datetime + timedelta(minutes=appointment.duration)
            appointment.end_time = end_datetime.time()
            
            # Book new slot
            appointment.sync_with_slot()
        
        appointment.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Appointment updated successfully',
            'data': appointment.to_dict(
                include_patient=True,
                include_doctor=True,
                include_details=True
            )
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointments_bp.route('/<int:appointment_id>/cancel', methods=['POST'])
def cancel_appointment(appointment_id):
    """Cancel an appointment"""
    try:
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment:
            return jsonify({
                'success': False,
                'error': 'Appointment not found'
            }), 404
        
        data = request.get_json()
        
        if not data or 'reason' not in data:
            return jsonify({
                'success': False,
                'error': 'Cancellation reason is required'
            }), 400
        
        success = appointment.cancel(
            reason=data['reason'],
            cancelled_by_user_id=data.get('cancelled_by_user_id')
        )
        
        if success:
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Appointment cancelled successfully',
                'data': appointment.to_dict()
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Appointment cannot be cancelled'
            }), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointments_bp.route('/<int:appointment_id>/check-in', methods=['POST'])
def check_in_appointment(appointment_id):
    """Check in a patient for their appointment"""
    try:
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment:
            return jsonify({
                'success': False,
                'error': 'Appointment not found'
            }), 404
        
        success = appointment.check_in()
        
        if success:
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Patient checked in successfully',
                'data': appointment.to_dict()
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Cannot check in for this appointment'
            }), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointments_bp.route('/<int:appointment_id>/check-out', methods=['POST'])
def check_out_appointment(appointment_id):
    """Check out a patient after their appointment"""
    try:
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment:
            return jsonify({
                'success': False,
                'error': 'Appointment not found'
            }), 404
        
        success = appointment.check_out()
        
        if success:
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Patient checked out successfully',
                'data': appointment.to_dict()
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Cannot check out for this appointment'
            }), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointments_bp.route('/<int:appointment_id>/no-show', methods=['POST'])
def mark_no_show(appointment_id):
    """Mark appointment as no-show"""
    try:
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment:
            return jsonify({
                'success': False,
                'error': 'Appointment not found'
            }), 404
        
        success = appointment.mark_no_show()
        
        if success:
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Appointment marked as no-show',
                'data': appointment.to_dict()
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Cannot mark this appointment as no-show'
            }), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@appointments_bp.route('/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    """Delete an appointment (hard delete)"""
    try:
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment:
            return jsonify({
                'success': False,
                'error': 'Appointment not found'
            }), 404
        
        # Release slot before deleting
        appointment.release_slot()
        
        db.session.delete(appointment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Appointment deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
