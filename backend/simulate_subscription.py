"""
Script para simular el paso de días en la suscripción trial
Útil para testing de la UI y comportamiento de suscripciones
"""

from datetime import datetime, timedelta
from models import db
from models.subscription import Subscription
from app import app

def simulate_trial_days(organization_id: int, days_elapsed: int):
    """
    Simula que han pasado X días desde que comenzó el trial
    
    Args:
        organization_id: ID de la organización
        days_elapsed: Días que queremos simular (ej: 10 para simular que quedan 5)
    """
    with app.app_context():
        subscription = Subscription.query.filter_by(
            organization_id=organization_id
        ).first()
        
        if not subscription:
            print(f"❌ No se encontró suscripción para organización {organization_id}")
            return
        
        if subscription.status != 'trial':
            print(f"⚠️  La suscripción no está en modo trial (estado actual: {subscription.status})")
            return
        
        # Calcular nuevas fechas
        original_start = subscription.current_period_start or datetime.utcnow()
        new_start = original_start - timedelta(days=days_elapsed)
        
        # Mantener los 15 días totales del trial
        new_trial_end = new_start + timedelta(days=15)
        
        # Actualizar
        subscription.current_period_start = new_start
        subscription.trial_end_date = new_trial_end
        subscription.current_period_end = new_trial_end
        
        db.session.commit()
        
        days_remaining = (new_trial_end - datetime.utcnow()).days
        
        print(f"✅ Suscripción actualizada!")
        print(f"📅 Inicio simulado: {new_start.strftime('%Y-%m-%d')}")
        print(f"📅 Fin del trial: {new_trial_end.strftime('%Y-%m-%d')}")
        print(f"⏰ Días restantes: {days_remaining}")
        print(f"📊 Estado: {subscription.status}")


def reset_trial(organization_id: int):
    """
    Reinicia el trial a 15 días completos desde hoy
    """
    with app.app_context():
        subscription = Subscription.query.filter_by(
            organization_id=organization_id
        ).first()
        
        if not subscription:
            print(f"❌ No se encontró suscripción para organización {organization_id}")
            return
        
        now = datetime.utcnow()
        trial_end = now + timedelta(days=15)
        
        subscription.current_period_start = now
        subscription.trial_end_date = trial_end
        subscription.current_period_end = trial_end
        subscription.status = 'trial'
        
        db.session.commit()
        
        print(f"✅ Trial reiniciado!")
        print(f"📅 Nuevo inicio: {now.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📅 Fin del trial: {trial_end.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"⏰ Días restantes: 15")


def list_subscriptions():
    """
    Lista todas las suscripciones activas
    """
    with app.app_context():
        subscriptions = Subscription.query.all()
        
        if not subscriptions:
            print("❌ No hay suscripciones en la base de datos")
            return
        
        print(f"\n📋 Total de suscripciones: {len(subscriptions)}\n")
        
        for sub in subscriptions:
            days_left = sub.days_until_expiry or 0
            print(f"ID: {sub.id} | Org: {sub.organization_id} | Plan: {sub.plan_name}")
            print(f"   Estado: {sub.status} | Días restantes: {days_left}")
            if sub.trial_end_date:
                print(f"   Trial termina: {sub.trial_end_date.strftime('%Y-%m-%d')}")
            print()


if __name__ == '__main__':
    import sys
    
    print("\n🧪 Simulador de Suscripciones Trial\n")
    print("=" * 50)
    
    # Primero listar suscripciones
    list_subscriptions()
    
    if len(sys.argv) < 2:
        print("\nUso:")
        print("  python simulate_subscription.py <org_id> <dias_transcurridos>")
        print("  python simulate_subscription.py <org_id> reset")
        print("\nEjemplos:")
        print("  python simulate_subscription.py 1 10    # Simula que pasaron 10 días (quedarán 5)")
        print("  python simulate_subscription.py 1 14    # Simula que pasaron 14 días (quedará 1)")
        print("  python simulate_subscription.py 1 reset # Reinicia a 15 días completos")
        sys.exit(1)
    
    org_id = int(sys.argv[1])
    
    if len(sys.argv) >= 3:
        if sys.argv[2].lower() == 'reset':
            reset_trial(org_id)
        else:
            days = int(sys.argv[2])
            simulate_trial_days(org_id, days)
            
        print("\n" + "=" * 50)
        print("✨ Recarga el dashboard para ver los cambios\n")
    else:
        print("❌ Falta especificar días o 'reset'")
