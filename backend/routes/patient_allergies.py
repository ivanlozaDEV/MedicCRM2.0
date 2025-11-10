"""
Patient Allergy routes for DoctorCRM API.
Handles CRUD operations for patient allergies.
"""
from flask import Blueprint, request, jsonify
from models import db, PatientAllergy, Patient
from datetime import datetime

patient_allergies_bp = Blueprint('patient_allergies', __name__, url_prefix='/api/patient-allergies')


@patient_allergies_bp.route('', methods=['GET'])
def get_all_allergies():
    """
    Get all allergies for a patient.
    Query params: patient_id, clinical_status
    """
    try:
        patient_id = request.args.get('patient_id', type=int)
        clinical_status = request.args.get('clinical_status')
        
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
        
        query = PatientAllergy.query.filter_by(patient_id=patient_id)
        
        if clinical_status:
            query = query.filter_by(clinical_status=clinical_status)
        
        allergies = query.order_by(PatientAllergy.criticality.desc(), PatientAllergy.recorded_date.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [allergy.to_dict() for allergy in allergies],
            'count': len(allergies)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_allergies_bp.route('/<int:allergy_id>', methods=['GET'])
def get_allergy(allergy_id):
    """Get a single allergy by ID"""
    try:
        allergy = PatientAllergy.query.get(allergy_id)
        
        if not allergy:
            return jsonify({
                'success': False,
                'error': 'Allergy not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': allergy.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_allergies_bp.route('', methods=['POST'])
def create_allergy():
    """Create a new patient allergy"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['patient_id', 'allergen']
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
        if 'onset_date' in data and isinstance(data['onset_date'], str):
            try:
                data['onset_date'] = datetime.strptime(data['onset_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid date format for onset_date. Use YYYY-MM-DD'
                }), 400
        
        if 'last_occurrence' in data and isinstance(data['last_occurrence'], str):
            try:
                data['last_occurrence'] = datetime.strptime(data['last_occurrence'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid date format for last_occurrence. Use YYYY-MM-DD'
                }), 400
        
        allergy = PatientAllergy.create(data)
        
        return jsonify({
            'success': True,
            'data': allergy.to_dict(),
            'message': 'Allergy created successfully'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_allergies_bp.route('/<int:allergy_id>', methods=['PUT'])
def update_allergy(allergy_id):
    """Update a patient allergy"""
    try:
        allergy = PatientAllergy.query.get(allergy_id)
        
        if not allergy:
            return jsonify({
                'success': False,
                'error': 'Allergy not found'
            }), 404
        
        data = request.get_json()
        
        # Convert date strings to date objects if present
        if 'onset_date' in data and isinstance(data['onset_date'], str):
            try:
                data['onset_date'] = datetime.strptime(data['onset_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid date format for onset_date. Use YYYY-MM-DD'
                }), 400
        
        if 'last_occurrence' in data and isinstance(data['last_occurrence'], str):
            try:
                data['last_occurrence'] = datetime.strptime(data['last_occurrence'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid date format for last_occurrence. Use YYYY-MM-DD'
                }), 400
        
        allergy.update(data)
        
        return jsonify({
            'success': True,
            'data': allergy.to_dict(),
            'message': 'Allergy updated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_allergies_bp.route('/<int:allergy_id>', methods=['DELETE'])
def delete_allergy(allergy_id):
    """Delete a patient allergy"""
    try:
        allergy = PatientAllergy.query.get(allergy_id)
        
        if not allergy:
            return jsonify({
                'success': False,
                'error': 'Allergy not found'
            }), 404
        
        allergy.delete()
        
        return jsonify({
            'success': True,
            'message': 'Allergy deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
