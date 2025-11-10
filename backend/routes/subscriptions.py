"""
Subscription routes for DoctorCRM API.
Handles CRUD operations for subscriptions.
"""
from flask import Blueprint, request, jsonify
from models import db, Subscription
from datetime import datetime
from lib.lemonsqueezy_service import lemonsqueezy_service
from config.lemonsqueezy import get_variant_id
import os

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
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@subscriptions_bp.route('/checkout', methods=['POST'])
def create_checkout():
    """
    Crea una sesión de checkout en LemonSqueezy para upgrade/activación de plan
    
    Body:
        plan_name: str (basic, premium, premium_plus)
        billing_cycle: str (monthly, yearly) - opcional, default monthly
        organization_id: int
        user_id: int
        user_email: str
        organization_name: str - opcional
    
    Returns:
        checkout_url: URL para redirigir al usuario al checkout
    """
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['plan_name', 'organization_id', 'user_id', 'user_email']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        plan_name = data['plan_name']
        billing_cycle = data.get('billing_cycle', 'monthly')
        organization_id = data['organization_id']
        user_id = data['user_id']
        user_email = data['user_email']
        organization_name = data.get('organization_name')
        
        # Validar plan
        valid_plans = ['basic', 'premium', 'premium_plus']
        if plan_name not in valid_plans:
            return jsonify({
                'success': False,
                'error': f'Invalid plan. Must be one of: {", ".join(valid_plans)}'
            }), 400
        
        # Validar billing cycle
        valid_cycles = ['monthly', 'yearly']
        if billing_cycle not in valid_cycles:
            return jsonify({
                'success': False,
                'error': f'Invalid billing_cycle. Must be one of: {", ".join(valid_cycles)}'
            }), 400
        
        # Obtener variant_id de LemonSqueezy
        variant_id = get_variant_id(plan_name, billing_cycle)
        
        if not variant_id:
            return jsonify({
                'success': False,
                'error': f'No variant configured for {plan_name} {billing_cycle}'
            }), 500
        
        # URL de redirección después del checkout
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f'{frontend_url}/dashboard/subscription?checkout=success'
        
        # Crear checkout en LemonSqueezy
        success, checkout_url, error = lemonsqueezy_service.create_checkout(
            variant_id=variant_id,
            organization_id=organization_id,
            user_id=user_id,
            user_email=user_email,
            redirect_url=redirect_url,
            organization_name=organization_name
        )
        
        if success:
            return jsonify({
                'success': True,
                'data': {
                    'checkout_url': checkout_url,
                    'plan_name': plan_name,
                    'billing_cycle': billing_cycle
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': error
            }), 500
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
