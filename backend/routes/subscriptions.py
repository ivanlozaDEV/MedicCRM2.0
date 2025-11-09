"""
Subscription routes for DoctorCRM API.
Handles CRUD operations for subscriptions.
"""
from flask import Blueprint, request, jsonify
from models import db, Subscription
from datetime import datetime

subscriptions_bp = Blueprint('subscriptions', __name__, url_prefix='/api/subscriptions')


@subscriptions_bp.route('', methods=['GET'])
def get_all_subscriptions():
    """Get all subscriptions with optional filters"""
    try:
        organization_id = request.args.get('organization_id', type=int)
        plan = request.args.get('plan')
        status = request.args.get('status')
        
        query = Subscription.query
        
        if organization_id:
            query = query.filter_by(organization_id=organization_id)
        
        if plan:
            query = query.filter_by(plan=plan)
        
        if status:
            query = query.filter_by(status=status)
        
        subscriptions = query.all()
        
        return jsonify({
            'success': True,
            'data': [sub.to_dict() for sub in subscriptions],
            'count': len(subscriptions)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@subscriptions_bp.route('/<int:subscription_id>', methods=['GET'])
def get_subscription(subscription_id):
    """Get a single subscription by ID"""
    try:
        subscription = Subscription.query.get(subscription_id)
        
        if not subscription:
            return jsonify({
                'success': False,
                'error': 'Subscription not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': subscription.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@subscriptions_bp.route('', methods=['POST'])
def create_subscription():
    """Create a new subscription"""
    try:
        data = request.get_json()
        
        if not data or 'organization_id' not in data or 'plan' not in data:
            return jsonify({
                'success': False,
                'error': 'organization_id and plan are required'
            }), 400
        
        subscription = Subscription.create(**data)
        
        return jsonify({
            'success': True,
            'message': 'Subscription created successfully',
            'data': subscription.to_dict()
        }), 201
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@subscriptions_bp.route('/<int:subscription_id>', methods=['PUT', 'PATCH'])
def update_subscription(subscription_id):
    """Update a subscription"""
    try:
        subscription = Subscription.query.get(subscription_id)
        
        if not subscription:
            return jsonify({
                'success': False,
                'error': 'Subscription not found'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        subscription.update(**data)
        
        return jsonify({
            'success': True,
            'message': 'Subscription updated successfully',
            'data': subscription.to_dict()
        }), 200
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@subscriptions_bp.route('/<int:subscription_id>/cancel', methods=['POST'])
def cancel_subscription(subscription_id):
    """Cancel a subscription"""
    try:
        subscription = Subscription.query.get(subscription_id)
        
        if not subscription:
            return jsonify({
                'success': False,
                'error': 'Subscription not found'
            }), 404
        
        subscription.cancel()
        
        return jsonify({
            'success': True,
            'message': 'Subscription canceled successfully',
            'data': subscription.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@subscriptions_bp.route('/<int:subscription_id>/renew', methods=['POST'])
def renew_subscription(subscription_id):
    """Renew a subscription"""
    try:
        subscription = Subscription.query.get(subscription_id)
        
        if not subscription:
            return jsonify({
                'success': False,
                'error': 'Subscription not found'
            }), 404
        
        subscription.renew()
        
        return jsonify({
            'success': True,
            'message': 'Subscription renewed successfully',
            'data': subscription.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@subscriptions_bp.route('/<int:subscription_id>', methods=['DELETE'])
def delete_subscription(subscription_id):
    """Delete a subscription permanently"""
    try:
        subscription = Subscription.query.get(subscription_id)
        
        if not subscription:
            return jsonify({
                'success': False,
                'error': 'Subscription not found'
            }), 404
        
        subscription.delete()
        
        return jsonify({
            'success': True,
            'message': 'Subscription deleted successfully'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
