"""
LemonSqueezy Configuration
Mapeo de planes a variant IDs de LemonSqueezy
"""

import os
from typing import Dict, Tuple, Optional

# API Configuration
LEMONSQUEEZY_API_KEY = os.getenv('LEMONSQUEEZY_API_KEY', '')
LEMONSQUEEZY_STORE_ID = os.getenv('LEMONSQUEEZY_STORE_ID', '')
LEMONSQUEEZY_WEBHOOK_SECRET = os.getenv('LEMONSQUEEZY_WEBHOOK_SECRET', '')
LEMONSQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1'

# Variant IDs - Configurados desde LemonSqueezy Test Mode
# Formato: (plan_name, billing_cycle) -> variant_id
VARIANT_IDS: Dict[Tuple[str, str], str] = {
    # Basic Plan
    ('basic', 'monthly'): '1081966',   # Basic Monthly - $9.99/month
    ('basic', 'yearly'): '1081970',    # Basic Yearly - $99.90/year
    
    # Premium Plan
    ('premium', 'monthly'): '1081972',   # Premium Monthly - $29.99/month
    ('premium', 'yearly'): '1081976',    # Premium Yearly - $299.90/year
    
    # Premium Plus Plan
    ('premium_plus', 'monthly'): '1081978',  # Premium Plus Monthly - $49.99/month
    ('premium_plus', 'yearly'): '1081979',   # Premium Plus Yearly - $499.90/year
}

def get_variant_id(plan_name: str, billing_cycle: str = 'monthly') -> Optional[str]:
    """
    Obtiene el variant_id de LemonSqueezy para un plan y ciclo de facturación
    
    Args:
        plan_name: Nombre del plan (basic, premium, premium_plus)
        billing_cycle: Ciclo de facturación (monthly, yearly)
    
    Returns:
        variant_id de LemonSqueezy o None si no existe
    """
    return VARIANT_IDS.get((plan_name, billing_cycle))

def get_plan_from_variant(variant_id: str) -> Optional[Tuple[str, str]]:
    """
    Obtiene el plan_name y billing_cycle desde un variant_id
    
    Args:
        variant_id: ID de variante de LemonSqueezy
    
    Returns:
        Tupla (plan_name, billing_cycle) o None si no existe
    """
    for (plan_name, billing_cycle), vid in VARIANT_IDS.items():
        if vid == variant_id:
            return (plan_name, billing_cycle)
    return None

def is_configured() -> bool:
    """
    Verifica si LemonSqueezy está configurado correctamente
    """
    return bool(
        LEMONSQUEEZY_API_KEY and 
        LEMONSQUEEZY_STORE_ID and 
        any(VARIANT_IDS.values())
    )
