/**
 * Subscription Plans Configuration
 * Define all available plans, pricing, features and limits
 */

export type PlanName = 'trial' | 'basic' | 'premium' | 'premium_plus';
export type BillingCycle = 'monthly' | 'yearly';

export interface PlanLimits {
  users: number;
  patients: number;
  appointmentsPerDay?: number;
  storageGB?: number;
}

export interface PlanPrice {
  monthly: number;
  yearly: number;
  yearlyDiscount?: number; // Percentage discount for yearly billing
}

export interface SubscriptionPlan {
  name: PlanName;
  displayName: string;
  description: string;
  price: PlanPrice;
  limits: PlanLimits;
  features: string[];
  popular?: boolean;
  color: string; // Tailwind color class
  lemonsqueezyVariantIds?: {
    monthly?: string;
    yearly?: string;
  };
}

export const SUBSCRIPTION_PLANS: Record<PlanName, SubscriptionPlan> = {
  trial: {
    name: 'trial',
    displayName: 'Trial',
    description: 'Prueba gratis por 15 días con todas las funciones del plan Básico',
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      users: 2,
      patients: 200,
      appointmentsPerDay: 20,
      storageGB: 1,
    },
    features: [
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
    color: 'blue',
  },

  basic: {
    name: 'basic',
    displayName: 'Básico',
    description: 'Perfecto para consultorios pequeños',
    price: {
      monthly: 9.99,
      yearly: 99.99, // ~17% descuento (2 meses gratis)
    },
    limits: {
      users: 2,
      patients: 200,
      appointmentsPerDay: 20,
      storageGB: 1,
    },
    features: [
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
    color: 'green',
  },

  premium: {
    name: 'premium',
    displayName: 'Premium',
    description: 'Para clínicas con varios profesionales',
    price: {
      monthly: 29.99,
      yearly: 299.99, // ~17% descuento (2 meses gratis)
    },
    limits: {
      users: 5,
      patients: 500,
      appointmentsPerDay: 50,
      storageGB: 5,
    },
    features: [
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
    popular: true,
    color: 'purple',
  },

  premium_plus: {
    name: 'premium_plus',
    displayName: 'Premium Plus',
    description: 'Para clínicas medianas con múltiples profesionales',
    price: {
      monthly: 49.99,
      yearly: 499.99, // ~17% descuento (2 meses gratis)
    },
    limits: {
      users: 10,
      patients: 1000,
      appointmentsPerDay: 100,
      storageGB: 10,
    },
    features: [
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
    ],
    color: 'indigo',
  },
};

/**
 * Get plan details by name
 */
export function getPlan(planName: PlanName): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[planName];
}

/**
 * Get all available plans
 */
export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS);
}

/**
 * Calculate price with discount for yearly billing
 */
export function getYearlyPrice(planName: PlanName): number {
  const plan = SUBSCRIPTION_PLANS[planName];
  return plan.price.yearly;
}

/**
 * Calculate monthly equivalent when paying yearly
 */
export function getMonthlyEquivalent(planName: PlanName): number {
  const plan = SUBSCRIPTION_PLANS[planName];
  return plan.price.yearly / 12;
}

/**
 * Get savings when choosing yearly vs monthly
 */
export function getYearlySavings(planName: PlanName): number {
  const plan = SUBSCRIPTION_PLANS[planName];
  const monthlyTotal = plan.price.monthly * 12;
  return monthlyTotal - plan.price.yearly;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Check if user can upgrade from current plan
 */
export function canUpgrade(currentPlan: PlanName, targetPlan: PlanName): boolean {
  const planOrder: PlanName[] = ['trial', 'basic', 'premium', 'premium_plus'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);
  return targetIndex > currentIndex;
}

/**
 * Check if user can downgrade from current plan
 */
export function canDowngrade(currentPlan: PlanName, targetPlan: PlanName): boolean {
  const planOrder: PlanName[] = ['trial', 'basic', 'premium', 'premium_plus'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);
  return targetIndex < currentIndex;
}

/**
 * Get recommended plan based on usage
 */
export function getRecommendedPlan(
  currentUsers: number,
  currentPatients: number
): PlanName {
  if (currentUsers <= 2 && currentPatients <= 200) return 'basic';
  if (currentUsers <= 5 && currentPatients <= 500) return 'premium';
  return 'premium_plus';
}
