"""
UserSpecialty routes for DoctorCRM API.
Handles specialty assignment to users (medical professionals).
"""
from flask import Blueprint, request, jsonify
from models import db, UserSpecialty, User, Specialty
from datetime import datetime

user_specialties_bp = Blueprint('user_specialties', __name__, url_prefix='/api/user-specialties')


@user_specialties_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_specialties(user_id):
    """Get all specialties assigned to a user"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        specialties = UserSpecialty.get_user_specialties(user_id, active_only=active_only)
        primary_specialty = UserSpecialty.get_primary_specialty(user_id)
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict(),
                'specialties': [spec.to_dict() for spec in specialties],
                'primary_specialty': primary_specialty.to_dict() if primary_specialty else None,
                'count': len(specialties)
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@user_specialties_bp.route('/specialty/<int:specialty_id>/users', methods=['GET'])
def get_users_by_specialty(specialty_id):
    """Get all users with a specific specialty"""
    try:
        specialty = Specialty.query.get(specialty_id)
        
        if not specialty:
            return jsonify({
                'success': False,
                'error': 'Specialty not found'
            }), 404
        
        users = UserSpecialty.get_users_by_specialty(specialty_id)
        
        return jsonify({
            'success': True,
            'data': {
                'specialty': specialty.to_dict(),
                'users': [user.to_dict() for user in users],
                'count': len(users)
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@user_specialties_bp.route('/assign', methods=['POST'])
def assign_specialty():
    """
    Assign a specialty to a user.
    Required: user_id, specialty_id
    Optional: is_primary, assigned_by
    """
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data or 'specialty_id' not in data:
            return jsonify({
                'success': False,
                'error': 'user_id and specialty_id are required'
            }), 400
        
        assignment = UserSpecialty.assign_specialty(
            user_id=data['user_id'],
            specialty_id=data['specialty_id'],
            is_primary=data.get('is_primary', False),
            assigned_by=data.get('assigned_by')
        )
        
        return jsonify({
            'success': True,
            'message': 'Specialty assigned successfully',
            'data': assignment.to_dict()
        }), 201
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@user_specialties_bp.route('/assign-multiple', methods=['POST'])
def assign_multiple_specialties():
    """
    Assign multiple specialties to a user at once.
    Required: user_id, specialty_ids (array)
    Optional: primary_specialty_id, assigned_by
    """
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data or 'specialty_ids' not in data:
            return jsonify({
                'success': False,
                'error': 'user_id and specialty_ids are required'
            }), 400
        
        if not isinstance(data['specialty_ids'], list):
            return jsonify({
                'success': False,
                'error': 'specialty_ids must be an array'
            }), 400
        
        assignments = UserSpecialty.assign_multiple_specialties(
            user_id=data['user_id'],
            specialty_ids=data['specialty_ids'],
            primary_specialty_id=data.get('primary_specialty_id'),
            assigned_by=data.get('assigned_by')
        )
        
        return jsonify({
            'success': True,
            'message': f'Assigned {len(assignments)} specialties successfully',
            'data': [assignment.to_dict() for assignment in assignments]
        }), 201
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@user_specialties_bp.route('/replace', methods=['POST'])
def replace_user_specialties():
    """
    Replace all specialties for a user with a new set.
    Required: user_id, specialty_ids (array)
    Optional: primary_specialty_id, assigned_by
    """
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data or 'specialty_ids' not in data:
            return jsonify({
                'success': False,
                'error': 'user_id and specialty_ids are required'
            }), 400
        
        if not isinstance(data['specialty_ids'], list):
            return jsonify({
                'success': False,
                'error': 'specialty_ids must be an array'
            }), 400
        
        assignments = UserSpecialty.replace_user_specialties(
            user_id=data['user_id'],
            specialty_ids=data['specialty_ids'],
            primary_specialty_id=data.get('primary_specialty_id'),
            assigned_by=data.get('assigned_by')
        )
        
        return jsonify({
            'success': True,
            'message': f'Replaced specialties successfully ({len(assignments)} specialties)',
            'data': [assignment.to_dict() for assignment in assignments]
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@user_specialties_bp.route('/set-primary', methods=['POST'])
def set_primary_specialty():
    """
    Set a specialty as primary for a user.
    Required: user_id, specialty_id
    """
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data or 'specialty_id' not in data:
            return jsonify({
                'success': False,
                'error': 'user_id and specialty_id are required'
            }), 400
        
        assignment = UserSpecialty.set_primary_specialty(
            user_id=data['user_id'],
            specialty_id=data['specialty_id']
        )
        
        if not assignment:
            return jsonify({
                'success': False,
                'error': 'User does not have this specialty assigned'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Primary specialty set successfully',
            'data': assignment.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@user_specialties_bp.route('/revoke', methods=['POST'])
def revoke_specialty():
    """
    Revoke a specialty from a user.
    Required: user_id, specialty_id
    """
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data or 'specialty_id' not in data:
            return jsonify({
                'success': False,
                'error': 'user_id and specialty_id are required'
            }), 400
        
        revoked = UserSpecialty.revoke_specialty(
            user_id=data['user_id'],
            specialty_id=data['specialty_id']
        )
        
        if not revoked:
            return jsonify({
                'success': False,
                'error': 'Specialty assignment not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Specialty revoked successfully'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
