"""
Patient Condition routes for DoctorCRM API.
Handles CRUD operations for patient conditions.
"""
from flask import Blueprint, request, jsonify
from models import db, PatientCondition, Patient
from datetime import datetime

patient_conditions_bp = Blueprint('patient_conditions', __name__, url_prefix='/api/patient-conditions')


@patient_conditions_bp.route('', methods=['GET'])
def get_all_conditions():
    """
    Get all conditions for a patient.
    Query params: patient_id, clinical_status, active_only
    """
    try:
        patient_id = request.args.get('patient_id', type=int)
        clinical_status = request.args.get('clinical_status')
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        
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
        
        query = PatientCondition.query.filter_by(patient_id=patient_id)
        
        if clinical_status:
            query = query.filter_by(clinical_status=clinical_status)
        
        conditions = query.order_by(PatientCondition.onset_date.desc()).all()
        
        # Filter active conditions if requested
        if active_only:
            conditions = [c for c in conditions if c.is_active]
        
        return jsonify({
            'success': True,
            'data': [condition.to_dict() for condition in conditions],
            'count': len(conditions)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_conditions_bp.route('/<int:condition_id>', methods=['GET'])
def get_condition(condition_id):
    """Get a single condition by ID"""
    try:
        include_recorder = request.args.get('include_recorder', 'false').lower() == 'true'
        
        condition = PatientCondition.query.get(condition_id)
        
        if not condition:
            return jsonify({
                'success': False,
                'error': 'Condition not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': condition.to_dict(include_recorder=include_recorder)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_conditions_bp.route('', methods=['POST'])
def create_condition():
    """Create a new patient condition"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['patient_id', 'condition_name']
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
        for date_field in ['onset_date', 'abatement_date']:
            if date_field in data and isinstance(data[date_field], str):
                try:
                    data[date_field] = datetime.strptime(data[date_field], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({
                        'success': False,
                        'error': f'Invalid date format for {date_field}. Use YYYY-MM-DD'
                    }), 400
        
        condition = PatientCondition.create(data)
        
        return jsonify({
            'success': True,
            'data': condition.to_dict(),
            'message': 'Condition created successfully'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_conditions_bp.route('/<int:condition_id>', methods=['PUT'])
def update_condition(condition_id):
    """Update a patient condition"""
    try:
        condition = PatientCondition.query.get(condition_id)
        
        if not condition:
            return jsonify({
                'success': False,
                'error': 'Condition not found'
            }), 404
        
        data = request.get_json()
        
        # Convert date strings to date objects if present
        for date_field in ['onset_date', 'abatement_date']:
            if date_field in data and isinstance(data[date_field], str):
                try:
                    data[date_field] = datetime.strptime(data[date_field], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({
                        'success': False,
                        'error': f'Invalid date format for {date_field}. Use YYYY-MM-DD'
                    }), 400
        
        condition.update(data)
        
        return jsonify({
            'success': True,
            'data': condition.to_dict(),
            'message': 'Condition updated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_conditions_bp.route('/<int:condition_id>', methods=['DELETE'])
def delete_condition(condition_id):
    """Delete a patient condition"""
    try:
        condition = PatientCondition.query.get(condition_id)
        
        if not condition:
            return jsonify({
                'success': False,
                'error': 'Condition not found'
            }), 404
        
        condition.delete()
        
        return jsonify({
            'success': True,
            'message': 'Condition deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_conditions_bp.route('/<int:condition_id>/resolve', methods=['POST'])
def resolve_condition(condition_id):
    """Mark a condition as resolved"""
    try:
        condition = PatientCondition.query.get(condition_id)
        
        if not condition:
            return jsonify({
                'success': False,
                'error': 'Condition not found'
            }), 404
        
        data = request.get_json() or {}
        abatement_date = data.get('abatement_date')
        notes = data.get('notes')
        
        # Convert date string if present
        if abatement_date and isinstance(abatement_date, str):
            try:
                abatement_date = datetime.strptime(abatement_date, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid date format for abatement_date. Use YYYY-MM-DD'
                }), 400
        
        condition.resolve(abatement_date=abatement_date, notes=notes)
        
        return jsonify({
            'success': True,
            'data': condition.to_dict(),
            'message': 'Condition marked as resolved'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
