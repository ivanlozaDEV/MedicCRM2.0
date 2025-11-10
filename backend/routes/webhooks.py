"""
Webhook routes for LemonSqueezy events.
Handles subscription creation, updates, and payment events.
"""
from flask import Blueprint, request, jsonify
from models import db, Subscription
from lib.lemonsqueezy_service import lemonsqueezy_service
from config.lemonsqueezy import get_plan_from_variant
from datetime import datetime

webhooks_bp = Blueprint('webhooks', __name__, url_prefix='/api/webhooks')


@webhooks_bp.route('/lemonsqueezy', methods=['POST'])
def lemonsqueezy_webhook():
    """
    Recibe y procesa webhooks de LemonSqueezy
    
    Eventos soportados:
    - subscription_created: Nueva suscripción creada
    - subscription_updated: Suscripción actualizada
    - subscription_payment_success: Pago exitoso
    - subscription_payment_failed: Pago fallido
    - subscription_cancelled: Suscripción cancelada
    """
    try:
        # Obtener firma del header
        signature = request.headers.get('X-Signature')
        
        if not signature:
            return jsonify({
                'success': False,
                'error': 'Missing signature'
            }), 401
        
        # Verificar firma del webhook
        payload = request.get_data()
        if not lemonsqueezy_service.verify_webhook_signature(payload, signature):
            return jsonify({
                'success': False,
                'error': 'Invalid signature'
            }), 401
        
        # Obtener datos del evento
        event_data = request.get_json()
        
        # Log del evento para debugging
        print(f"📨 Webhook recibido: {event_data.get('meta', {}).get('event_name', 'unknown')}")
        
        # Procesar evento
        success, subscription_data, error = lemonsqueezy_service.process_webhook_event(event_data)
        
        if not success:
            print(f"⚠️  Error procesando webhook: {error}")
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        event_name = subscription_data.get('event_name')
        organization_id = subscription_data.get('organization_id')
        
        # Si no hay organization_id, es un evento que no nos interesa (ej: order_created, license_key_created, etc)
        # Lo ignoramos pero retornamos 200 para que LemonSqueezy no lo reintente
        if not organization_id:
            print(f"ℹ️  Evento {event_name} sin organization_id, ignorando...")
            return jsonify({
                'success': True,
                'message': f'Event {event_name} ignored (no organization_id)'
            }), 200
        
        # Obtener plan_name y billing_cycle del variant_id
        variant_id = subscription_data.get('variant_id')
        plan_info = get_plan_from_variant(variant_id)
        
        if not plan_info:
            return jsonify({
                'success': False,
                'error': f'Unknown variant_id: {variant_id}'
            }), 400
        
        plan_name, billing_cycle = plan_info
        
        # Buscar suscripción existente de la organización
        subscription = Subscription.query.filter_by(organization_id=organization_id).first()
        
        # Manejar diferentes eventos
        if event_name == 'subscription_created':
            if subscription:
                # Actualizar suscripción existente (upgrade desde trial)
                subscription.plan_name = plan_name
                subscription.billing_cycle = billing_cycle
                subscription.status = 'active'
                subscription.lemonsqueezy_subscription_id = subscription_data.get('lemonsqueezy_subscription_id')
                subscription.lemonsqueezy_customer_id = subscription_data.get('lemonsqueezy_customer_id')
                subscription.lemonsqueezy_variant_id = variant_id
                subscription.update_payment_url = subscription_data.get('update_payment_url')
                
                # Actualizar fechas
                renews_at = subscription_data.get('renews_at')
                if renews_at:
                    subscription.current_period_end = datetime.fromisoformat(renews_at.replace('Z', '+00:00'))
                subscription.current_period_start = datetime.utcnow()
                subscription.trial_end_date = None  # Ya no es trial
                
                subscription.update()
            else:
                # Crear nueva suscripción
                renews_at = subscription_data.get('renews_at')
                period_end = datetime.fromisoformat(renews_at.replace('Z', '+00:00')) if renews_at else None
                
                subscription = Subscription.create(
                    organization_id=organization_id,
                    plan_name=plan_name,
                    billing_cycle=billing_cycle,
                    status='active',
                    lemonsqueezy_subscription_id=subscription_data.get('lemonsqueezy_subscription_id'),
                    lemonsqueezy_customer_id=subscription_data.get('lemonsqueezy_customer_id'),
                    lemonsqueezy_variant_id=variant_id,
                    update_payment_url=subscription_data.get('update_payment_url'),
                    current_period_start=datetime.utcnow(),
                    current_period_end=period_end
                )
        
        elif event_name == 'subscription_updated':
            if subscription:
                subscription.status = map_lemonsqueezy_status(subscription_data.get('status'))
                subscription.lemonsqueezy_variant_id = variant_id
                subscription.plan_name = plan_name
                subscription.billing_cycle = billing_cycle
                subscription.update_payment_url = subscription_data.get('update_payment_url')
                
                # Actualizar fechas
                renews_at = subscription_data.get('renews_at')
                if renews_at:
                    subscription.current_period_end = datetime.fromisoformat(renews_at.replace('Z', '+00:00'))
                
                ends_at = subscription_data.get('ends_at')
                if ends_at:
                    subscription.canceled_at = datetime.fromisoformat(ends_at.replace('Z', '+00:00'))
                
                subscription.update()
        
        elif event_name == 'subscription_payment_success':
            if subscription:
                subscription.status = 'active'
                
                # Actualizar período actual
                renews_at = subscription_data.get('renews_at')
                if renews_at:
                    subscription.current_period_start = datetime.utcnow()
                    subscription.current_period_end = datetime.fromisoformat(renews_at.replace('Z', '+00:00'))
                
                subscription.update()
        
        elif event_name == 'subscription_payment_failed':
            if subscription:
                subscription.status = 'past_due'
                subscription.update()
        elif event_name == 'subscription_cancelled':
            if subscription:
                subscription.status = 'canceled'
                subscription.canceled_at = datetime.utcnow()
                subscription.update()
        
        print(f"✅ Webhook procesado exitosamente: {event_name} para org_id={organization_id}")
        
        return jsonify({
            'success': True,
            'message': f'Webhook processed: {event_name}',
            'subscription_id': subscription.id if subscription else None
        }), 200
    
    except Exception as e:
        print(f'❌ Webhook error: {str(e)}')
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def map_lemonsqueezy_status(ls_status: str) -> str:
    """
    Mapea el status de LemonSqueezy a nuestro status interno
    
    LemonSqueezy statuses:
    - on_trial
    - active
    - paused
    - past_due
    - unpaid
    - cancelled
    - expired
    """
    status_map = {
        'on_trial': 'trial',
        'active': 'active',
        'paused': 'paused',
        'past_due': 'past_due',
        'unpaid': 'past_due',
        'cancelled': 'canceled',
        'expired': 'canceled'
    }
    
    return status_map.get(ls_status, 'trial')
