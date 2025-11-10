"""
Subscription Plans Configuration
Define all available plans, pricing, features and limits for LemonSqueezy integration
"""

from typing import Dict, List, Optional
from decimal import Decimal

# Plan Types
PLAN_TRIAL = 'trial'
PLAN_BASIC = 'basic'
PLAN_PREMIUM = 'premium'
PLAN_PREMIUM_PLUS = 'premium_plus'

# Billing Cycles
CYCLE_MONTHLY = 'monthly'
CYCLE_YEARLY = 'yearly'

# Plan Limits Configuration
PLAN_LIMITS = {
    PLAN_TRIAL: {
        'max_users': 2,
        'max_patients': 200,
        'max_appointments_per_day': 20,
        'storage_gb': 1,
    },
    PLAN_BASIC: {
        'max_users': 2,
        'max_patients': 200,
        'max_appointments_per_day': 20,
        'storage_gb': 1,
    },
    PLAN_PREMIUM: {
        'max_users': 5,
        'max_patients': 500,
        'max_appointments_per_day': 50,
        'storage_gb': 5,
    },
    PLAN_PREMIUM_PLUS: {
        'max_users': 10,
        'max_patients': 1000,
        'max_appointments_per_day': 100,
        'storage_gb': 10,
    }
}

# Plan Pricing (USD)
PLAN_PRICES = {
    PLAN_TRIAL: {
        'monthly': Decimal('0.00'),
        'yearly': Decimal('0.00'),
    },
    PLAN_BASIC: {
        'monthly': Decimal('9.99'),
        'yearly': Decimal('99.99'),  # ~17% discount (2 months free)
    },
    PLAN_PREMIUM: {
        'monthly': Decimal('29.99'),
        'yearly': Decimal('299.99'),  # ~17% discount (2 months free)
    },
    PLAN_PREMIUM_PLUS: {
        'monthly': Decimal('49.99'),
        'yearly': Decimal('499.99'),  # ~17% discount (2 months free)
    }
}

# LemonSqueezy Variant IDs (to be configured after creating products in LemonSqueezy)
LEMONSQUEEZY_VARIANTS = {
    PLAN_BASIC: {
        'monthly': None,  # TODO: Add LemonSqueezy variant ID
        'yearly': None,   # TODO: Add LemonSqueezy variant ID
    },
    PLAN_PREMIUM: {
        'monthly': None,  # TODO: Add LemonSqueezy variant ID
        'yearly': None,   # TODO: Add LemonSqueezy variant ID
    },
    PLAN_PREMIUM_PLUS: {
        'monthly': None,  # TODO: Add LemonSqueezy variant ID
        'yearly': None,   # TODO: Add LemonSqueezy variant ID
    }
}

# Plan Features (for display and documentation)
PLAN_FEATURES = {
    PLAN_TRIAL: [
        '15 días de prueba gratis',
        'Hasta 2 usuarios',
        'Hasta 200 pacientes',
        'Hasta 20 citas por día',
        '1 GB de almacenamiento',
        'Agenda avanzada',
        'Historial clínico completo',
        'Recetas digitales',
        'Reportes básicos',
        'Soporte por email',
    ],
    PLAN_BASIC: [
        'Hasta 2 usuarios',
        'Hasta 200 pacientes',
        'Hasta 20 citas por día',
        '1 GB de almacenamiento',
        'Agenda avanzada',
        'Historial clínico completo',
        'Recetas digitales',
        'Múltiples especialidades',
        'Reportes básicos',
        'Recordatorios automáticos',
        'Exportación de datos',
        'Soporte por email',
    ],
    PLAN_PREMIUM: [
        'Hasta 5 usuarios',
        'Hasta 500 pacientes',
        'Hasta 50 citas por día',
        '5 GB de almacenamiento',
        'Agenda multi-profesional',
        'Historial clínico completo',
        'Recetas digitales',
        'Múltiples especialidades',
        'Facturación electrónica',
        'Reportes avanzados',
        'Recordatorios Email + SMS',
        'WhatsApp Business',
        'API access',
        'Soporte prioritario',
        'Backup automático diario',
    ],
    PLAN_PREMIUM_PLUS: [
        'Hasta 10 usuarios',
        'Hasta 1,000 pacientes',
        'Hasta 100 citas por día',
        '10 GB de almacenamiento',
        'Agenda multi-profesional',
        'Historial clínico ilimitado',
        'Recetas digitales',
        'Múltiples especialidades',
        'Facturación electrónica avanzada',
        'Reportes y analytics completos',
        'Recordatorios multicanal',
        'WhatsApp Business integrado',
        'Telemedicina (videollamadas)',
        'API access completo',
        'Soporte 24/7',
        'Backup automático en tiempo real',
        'Personalización avanzada',
    ]
}


def get_plan_limits(plan_name: str) -> Dict:
    """Get limits for a specific plan"""
    return PLAN_LIMITS.get(plan_name, PLAN_LIMITS[PLAN_TRIAL])


def get_plan_price(plan_name: str, billing_cycle: str) -> Decimal:
    """Get price for a specific plan and billing cycle"""
    plan_prices = PLAN_PRICES.get(plan_name, PLAN_PRICES[PLAN_TRIAL])
    return plan_prices.get(billing_cycle, Decimal('0.00'))


def get_lemonsqueezy_variant_id(plan_name: str, billing_cycle: str) -> Optional[str]:
    """Get LemonSqueezy variant ID for a plan and billing cycle"""
    if plan_name == PLAN_TRIAL:
        return None
    variants = LEMONSQUEEZY_VARIANTS.get(plan_name, {})
    return variants.get(billing_cycle)


def validate_plan_name(plan_name: str) -> bool:
    """Validate if plan name is valid"""
    return plan_name in PLAN_LIMITS


def validate_billing_cycle(billing_cycle: str) -> bool:
    """Validate if billing cycle is valid"""
    return billing_cycle in [CYCLE_MONTHLY, CYCLE_YEARLY]


def can_upgrade(current_plan: str, target_plan: str) -> bool:
    """Check if upgrade is allowed"""
    plan_order = [PLAN_TRIAL, PLAN_BASIC, PLAN_PREMIUM, PLAN_PREMIUM_PLUS]
    try:
        current_index = plan_order.index(current_plan)
        target_index = plan_order.index(target_plan)
        return target_index > current_index
    except ValueError:
        return False


def can_downgrade(current_plan: str, target_plan: str) -> bool:
    """Check if downgrade is allowed"""
    plan_order = [PLAN_TRIAL, PLAN_BASIC, PLAN_PREMIUM, PLAN_PREMIUM_PLUS]
    try:
        current_index = plan_order.index(current_plan)
        target_index = plan_order.index(target_plan)
        return target_index < current_index
    except ValueError:
        return False


def get_recommended_plan(current_users: int, current_patients: int) -> str:
    """Get recommended plan based on current usage"""
    if current_users <= 2 and current_patients <= 200:
        return PLAN_BASIC
    elif current_users <= 5 and current_patients <= 500:
        return PLAN_PREMIUM
    else:
        return PLAN_PREMIUM_PLUS


def calculate_yearly_savings(plan_name: str) -> Decimal:
    """Calculate savings when choosing yearly vs monthly billing"""
    if plan_name == PLAN_TRIAL:
        return Decimal('0.00')
    
    monthly_price = get_plan_price(plan_name, CYCLE_MONTHLY)
    yearly_price = get_plan_price(plan_name, CYCLE_YEARLY)
    
    monthly_total = monthly_price * 12
    return monthly_total - yearly_price


def get_all_plans() -> List[str]:
    """Get list of all available plans"""
    return [PLAN_TRIAL, PLAN_BASIC, PLAN_PREMIUM, PLAN_PREMIUM_PLUS]
