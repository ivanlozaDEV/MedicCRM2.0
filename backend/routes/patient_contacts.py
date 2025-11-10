"""
Patient Contact routes for DoctorCRM API.
Handles CRUD operations for patient emergency contacts.
"""
from flask import Blueprint, request, jsonify
from models import db, PatientContact, Patient

patient_contacts_bp = Blueprint('patient_contacts', __name__, url_prefix='/api/patient-contacts')


@patient_contacts_bp.route('', methods=['GET'])
def get_all_contacts():
    """
    Get all patient contacts.
    Query params: patient_id
    """
    try:
        patient_id = request.args.get('patient_id', type=int)
        
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
        
        contacts = PatientContact.query.filter_by(patient_id=patient_id)\
            .order_by(PatientContact.is_primary.desc(), PatientContact.priority_order)\
            .all()
        
        return jsonify({
            'success': True,
            'data': [contact.to_dict() for contact in contacts],
            'count': len(contacts)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_contacts_bp.route('/<int:contact_id>', methods=['GET'])
def get_contact(contact_id):
    """Get a single patient contact by ID"""
    try:
        contact = PatientContact.query.get(contact_id)
        
        if not contact:
            return jsonify({
                'success': False,
                'error': 'Contact not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': contact.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_contacts_bp.route('', methods=['POST'])
def create_contact():
    """Create a new patient contact"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['patient_id', 'first_name', 'last_name', 'relationship', 'phone']
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
        
        # If this is set as primary, unset other primary contacts
        if data.get('is_primary', False):
            existing_primary = PatientContact.query.filter_by(
                patient_id=data['patient_id'],
                is_primary=True
            ).all()
            for contact in existing_primary:
                contact.is_primary = False
            db.session.commit()
        
        contact = PatientContact.create(data)
        
        return jsonify({
            'success': True,
            'data': contact.to_dict(),
            'message': 'Contact created successfully'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_contacts_bp.route('/<int:contact_id>', methods=['PUT'])
def update_contact(contact_id):
    """Update a patient contact"""
    try:
        contact = PatientContact.query.get(contact_id)
        
        if not contact:
            return jsonify({
                'success': False,
                'error': 'Contact not found'
            }), 404
        
        data = request.get_json()
        
        # If this is being set as primary, unset other primary contacts
        if data.get('is_primary', False) and not contact.is_primary:
            existing_primary = PatientContact.query.filter_by(
                patient_id=contact.patient_id,
                is_primary=True
            ).all()
            for other_contact in existing_primary:
                other_contact.is_primary = False
            db.session.commit()
        
        contact.update(data)
        
        return jsonify({
            'success': True,
            'data': contact.to_dict(),
            'message': 'Contact updated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_contacts_bp.route('/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    """Delete a patient contact"""
    try:
        contact = PatientContact.query.get(contact_id)
        
        if not contact:
            return jsonify({
                'success': False,
                'error': 'Contact not found'
            }), 404
        
        contact.delete()
        
        return jsonify({
            'success': True,
            'message': 'Contact deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_contacts_bp.route('/<int:contact_id>/set-primary', methods=['POST'])
def set_primary_contact(contact_id):
    """Set a contact as the primary emergency contact"""
    try:
        contact = PatientContact.query.get(contact_id)
        
        if not contact:
            return jsonify({
                'success': False,
                'error': 'Contact not found'
            }), 404
        
        # Unset other primary contacts for this patient
        existing_primary = PatientContact.query.filter_by(
            patient_id=contact.patient_id,
            is_primary=True
        ).all()
        for other_contact in existing_primary:
            other_contact.is_primary = False
        
        # Set this contact as primary
        contact.is_primary = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': contact.to_dict(),
            'message': 'Contact set as primary successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@patient_contacts_bp.route('/patient/<int:patient_id>/reorder', methods=['POST'])
def reorder_contacts(patient_id):
    """
    Reorder contacts for a patient.
    Expects: { "contact_ids": [3, 1, 2] } in order of priority
    """
    try:
        # Verify patient exists
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({
                'success': False,
                'error': 'Patient not found'
            }), 404
        
        data = request.get_json()
        contact_ids = data.get('contact_ids', [])
        
        if not contact_ids:
            return jsonify({
                'success': False,
                'error': 'contact_ids array is required'
            }), 400
        
        # Update priority order
        for index, contact_id in enumerate(contact_ids, start=1):
            contact = PatientContact.query.get(contact_id)
            if contact and contact.patient_id == patient_id:
                contact.priority_order = index
        
        db.session.commit()
        
        # Return updated contacts
        contacts = PatientContact.query.filter_by(patient_id=patient_id)\
            .order_by(PatientContact.priority_order)\
            .all()
        
        return jsonify({
            'success': True,
            'data': [contact.to_dict() for contact in contacts],
            'message': 'Contacts reordered successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
