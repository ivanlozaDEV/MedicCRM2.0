"""
Patient Medication routes for DoctorCRM API.
Handles CRUD operations for patient medications.
"""
from flask import Blueprint, request, jsonify
from models import db, PatientMedication, Patient
from datetime import datetime

patient_medications_bp = Blueprint('patient_medications', __name__, url_prefix='/api/patient-medications')


@patient_medications_bp.route('', methods=['GET'])
def get_all_medications():
    """
    Get all medications for a patient.
    Query params: patient_id, status, current_only
    """
    try:
        patient_id = request.args.get('patient_id', type=int)
        status = request.args.get('status')
        current_only = request.args.get('current_only', 'false').lower() == 'true'
        
        if not patient_id:
            return jsonify({
                'success': False,
                'error': 'patient_id is required'
            }), 400
        
        # Verify patient exists
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({
                'success': False,
                'error': 'Patient not found'
            }), 404
        
        query = PatientMedication.query.filter_by(patient_id=patient_id)
        
        if status:
            query = query.filter_by(status=status)
        
        medications = query.order_by(PatientMedication.start_date.desc()).all()
        
        # Filter current medications if requested
        if current_only:
            medications = [m for m in medications if m.is_current]
        
        return jsonify({
            'success': True,
            'data': [medication.to_dict() for medication in medications],
            'count': len(medications)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_medications_bp.route('/<int:medication_id>', methods=['GET'])
def get_medication(medication_id):
    """Get a single medication by ID"""
    try:
        include_prescriber = request.args.get('include_prescriber', 'false').lower() == 'true'
        
        medication = PatientMedication.query.get(medication_id)
        
        if not medication:
            return jsonify({
                'success': False,
                'error': 'Medication not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': medication.to_dict(include_prescriber=include_prescriber)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_medications_bp.route('', methods=['POST'])
def create_medication():
    """Create a new patient medication"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['patient_id', 'medication_name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Verify patient exists
        patient = Patient.query.get(data['patient_id'])
        if not patient:
            return jsonify({
                    'success': False,
                'error': 'Patient not found'
            }), 404
        
        # Convert date strings to date objects if present
        for date_field in ['start_date', 'end_date']:
            if date_field in data:
                # Handle empty strings - convert to None
                if data[date_field] == '' or data[date_field] is None:
                    data[date_field] = None
                # Handle valid date strings
                elif isinstance(data[date_field], str):
                    try:
                        data[date_field] = datetime.strptime(data[date_field], '%Y-%m-%d').date()
                    except ValueError:
                        return jsonify({
                            'success': False,
                            'error': f'Invalid date format for {date_field}. Use YYYY-MM-DD'
                        }), 400
        
        medication = PatientMedication.create(data)
        
        return jsonify({
            'success': True,
            'data': medication.to_dict(),
            'message': 'Medication created successfully'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_medications_bp.route('/<int:medication_id>', methods=['PUT'])
def update_medication(medication_id):
    """Update a patient medication"""
    try:
        medication = PatientMedication.query.get(medication_id)
        
        if not medication:
            return jsonify({
                'success': False,
                'error': 'Medication not found'
            }), 404
        
        data = request.get_json()
        
        # Convert date strings to date objects if present
        for date_field in ['start_date', 'end_date']:
            if date_field in data:
                # Handle empty strings - convert to None
                if data[date_field] == '' or data[date_field] is None:
                    data[date_field] = None
                # Handle valid date strings
                elif isinstance(data[date_field], str):
                    try:
                        data[date_field] = datetime.strptime(data[date_field], '%Y-%m-%d').date()
                    except ValueError:
                        return jsonify({
                            'success': False,
                            'error': f'Invalid date format for {date_field}. Use YYYY-MM-DD'
                        }), 400
        
        medication.update(data)
        
        return jsonify({
            'success': True,
            'data': medication.to_dict(),
            'message': 'Medication updated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_medications_bp.route('/<int:medication_id>', methods=['DELETE'])
def delete_medication(medication_id):
    """Delete a patient medication"""
    try:
        medication = PatientMedication.query.get(medication_id)
        
        if not medication:
            return jsonify({
                'success': False,
                'error': 'Medication not found'
            }), 404
        
        medication.delete()
        
        return jsonify({
            'success': True,
            'message': 'Medication deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_medications_bp.route('/<int:medication_id>/discontinue', methods=['POST'])
def discontinue_medication(medication_id):
    """Discontinue a medication"""
    try:
        medication = PatientMedication.query.get(medication_id)
        
        if not medication:
            return jsonify({
                'success': False,
                'error': 'Medication not found'
            }), 404
        
        data = request.get_json() or {}
        reason = data.get('reason')
        
        medication.discontinue(reason=reason)
        
        return jsonify({
            'success': True,
            'data': medication.to_dict(),
            'message': 'Medication discontinued successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
