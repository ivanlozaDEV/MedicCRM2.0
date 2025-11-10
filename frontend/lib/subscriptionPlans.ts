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
    description: 'Prueba gratis por 15 días',
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
      '2 usuarios',
      '200 pacientes',
      'Gestión de citas',
      'Historial clínico',
      'Recetas médicas',
      'Soporte por email',
    ],
    color: 'blue',
  },

  basic: {
    name: 'basic',
    displayName: 'Básico',
    description: 'Ideal para consultorios pequeños',
    price: {
      monthly: 9.99,
      yearly: 99.99, // ~17% descuento (2 meses gratis)
    },
    limits: {
      users: 2,
      patients: 200,
      appointmentsPerDay: 20,
      storageGB: 5,
    },
    features: [
      '2 usuarios',
      '200 pacientes',
      'Gestión de citas',
      'Historial clínico completo',
      'Recetas digitales',
      'Recordatorios por email',
      'Reportes básicos',
      'Soporte por email',
    ],
    color: 'green',
  },

  premium: {
    name: 'premium',
    displayName: 'Premium',
    description: 'Para clínicas en crecimiento',
    price: {
      monthly: 29.99,
      yearly: 299.99, // ~17% descuento (2 meses gratis)
    },
    limits: {
      users: 5,
      patients: 500,
      appointmentsPerDay: 50,
      storageGB: 20,
    },
    features: [
      '5 usuarios',
      '500 pacientes',
      'Agenda multi-usuario',
      'Historial clínico avanzado',
      'Recetas y plantillas',
      'Recordatorios SMS + Email',
      'Estadísticas avanzadas',
      'Exportación de datos',
      'Backup automático',
      'Soporte prioritario',
    ],
    popular: true,
    color: 'purple',
  },

  premium_plus: {
    name: 'premium_plus',
    displayName: 'Premium Plus',
    description: 'Para clínicas establecidas',
    price: {
      monthly: 49.99,
      yearly: 499.99, // ~17% descuento (2 meses gratis)
    },
    limits: {
      users: 10,
      patients: 1000,
      appointmentsPerDay: 100,
      storageGB: 50,
    },
    features: [
      '10 usuarios',
      '1,000 pacientes',
      'Agenda multi-sede',
      'Historial clínico ilimitado',
      'Plantillas personalizadas',
      'Recordatorios multicanal',
      'Dashboard ejecutivo',
      'Exportación avanzada',
      'Backup en tiempo real',
      'Integración WhatsApp',
      'Soporte dedicado',
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
