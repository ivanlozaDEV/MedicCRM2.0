"""
Patient routes for DoctorCRM API.
Handles CRUD operations for patients.
"""
from flask import Blueprint, request, jsonify
from models import db, Patient
from datetime import datetime

patients_bp = Blueprint('patients', __name__, url_prefix='/api/patients')


@patients_bp.route('', methods=['GET'])
def get_all_patients():
    """
    Get all patients.
    Query params: organization_id, active_only, include_contacts, search
    """
    try:
        organization_id = request.args.get('organization_id', type=int)
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        include_contacts = request.args.get('include_contacts', 'false').lower() == 'true'
        search = request.args.get('search', '').strip()
        
        query = Patient.query
        
        if organization_id:
            query = query.filter_by(organization_id=organization_id)
        
        if active_only:
            query = query.filter_by(is_active=True)
        
        # Search by name, email, phone, or ID number
        if search:
            search_filter = db.or_(
                Patient.first_name.ilike(f'%{search}%'),
                Patient.last_name.ilike(f'%{search}%'),
                Patient.email.ilike(f'%{search}%'),
                Patient.phone.ilike(f'%{search}%'),
                Patient.id_number.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)
        
        patients = query.all()
        
        return jsonify({
            'success': True,
            'data': [patient.to_dict(include_contacts=include_contacts) for patient in patients],
            'count': len(patients)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patients_bp.route('/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Get a single patient by ID"""
    try:
        include_contacts = request.args.get('include_contacts', 'false').lower() == 'true'
        
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({
                'success': False,
                'error': 'Patient not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': patient.to_dict(include_contacts=include_contacts)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patients_bp.route('', methods=['POST'])
def create_patient():
    """Create a new patient"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['organization_id', 'first_name', 'last_name', 'date_of_birth']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Convert date_of_birth string to date object
        if isinstance(data['date_of_birth'], str):
            try:
                data['date_of_birth'] = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid date format for date_of_birth. Use YYYY-MM-DD'
                }), 400
        
        # Check for duplicate ID number in the same organization
        if data.get('id_number'):
            existing = Patient.query.filter_by(
                organization_id=data['organization_id'],
                id_number=data['id_number']
            ).first()
            if existing:
                return jsonify({
                    'success': False,
                    'error': 'A patient with this ID number already exists in your organization'
                }), 400
        
        patient = Patient.create(data)
        
        return jsonify({
            'success': True,
            'data': patient.to_dict(),
            'message': 'Patient created successfully'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patients_bp.route('/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    """Update a patient"""
    try:
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({
                'success': False,
                'error': 'Patient not found'
            }), 404
        
        data = request.get_json()
        
        # Convert date_of_birth string to date object if present
        if 'date_of_birth' in data and isinstance(data['date_of_birth'], str):
            try:
                data['date_of_birth'] = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid date format for date_of_birth. Use YYYY-MM-DD'
                }), 400
        
        # Check for duplicate ID number if being updated
        if 'id_number' in data and data['id_number'] != patient.id_number:
            existing = Patient.query.filter_by(
                organization_id=patient.organization_id,
                id_number=data['id_number']
            ).first()
            if existing:
                return jsonify({
                    'success': False,
                    'error': 'A patient with this ID number already exists in your organization'
                }), 400
        
        patient.update(data)
        
        return jsonify({
            'success': True,
            'data': patient.to_dict(),
            'message': 'Patient updated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patients_bp.route('/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    """Delete a patient (soft delete)"""
    try:
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({
                'success': False,
                'error': 'Patient not found'
            }), 404
        
        # Check if hard delete is requested
        hard_delete = request.args.get('hard', 'false').lower() == 'true'
        
        if hard_delete:
            patient.hard_delete()
            message = 'Patient permanently deleted'
        else:
            patient.delete()
            message = 'Patient deactivated successfully'
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patients_bp.route('/<int:patient_id>/activate', methods=['POST'])
def activate_patient(patient_id):
    """Reactivate a deactivated patient"""
    try:
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({
                'success': False,
                'error': 'Patient not found'
            }), 404
        
        patient.is_active = True
        patient.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': patient.to_dict(),
            'message': 'Patient activated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patients_bp.route('/stats', methods=['GET'])
def get_patient_stats():
    """Get patient statistics for an organization"""
    try:
        organization_id = request.args.get('organization_id', type=int)
        
        if not organization_id:
            return jsonify({
                'success': False,
                'error': 'organization_id is required'
            }), 400
        
        total_patients = Patient.query.filter_by(organization_id=organization_id).count()
        active_patients = Patient.query.filter_by(organization_id=organization_id, is_active=True).count()
        inactive_patients = total_patients - active_patients
        
        # Get patients by gender
        male_count = Patient.query.filter_by(organization_id=organization_id, gender='Male', is_active=True).count()
        female_count = Patient.query.filter_by(organization_id=organization_id, gender='Female', is_active=True).count()
        
        # Get new patients this month
        current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_this_month = Patient.query.filter(
            Patient.organization_id == organization_id,
            Patient.created_at >= current_month_start
        ).count()
        
        return jsonify({
            'success': True,
            'data': {
                'total_patients': total_patients,
                'active_patients': active_patients,
                'inactive_patients': inactive_patients,
                'by_gender': {
                    'male': male_count,
                    'female': female_count
                },
                'new_this_month': new_this_month
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
