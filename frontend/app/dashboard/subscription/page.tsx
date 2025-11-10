'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { subscriptionService, Subscription as SubscriptionType } from '@/lib/services/subscriptionService'
import { 
  SUBSCRIPTION_PLANS, 
  BillingCycle, 
  PlanName,
  formatPrice,
  canUpgrade,
  canDowngrade
} from '@/lib/subscriptionPlans'
import { 
  CreditCard, 
  Users, 
  UserPlus, 
  Calendar, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Crown,
  Sparkles,
  Rocket,
  Shield
} from 'lucide-react'

interface UsageStats {
  users: number
  patients: number
}

const PLAN_ICONS = {
  trial: Sparkles,
  basic: Rocket,
  premium: Crown,
  premium_plus: Shield
}

const PLAN_COLORS = {
  trial: 'text-blue-500',
  basic: 'text-green-500',
  premium: 'text-purple-500',
  premium_plus: 'text-indigo-500'
}

const PLAN_BG_COLORS = {
  trial: 'bg-blue-50 border-blue-200',
  basic: 'bg-green-50 border-green-200',
  premium: 'bg-purple-50 border-purple-200',
  premium_plus: 'bg-indigo-50 border-indigo-200'
}

const STATUS_COLORS = {
  trial: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  past_due: 'bg-red-100 text-red-800',
  canceled: 'bg-gray-100 text-gray-800',
  paused: 'bg-yellow-100 text-yellow-800'
}

const STATUS_LABELS = {
  trial: 'Prueba',
  active: 'Activa',
  past_due: 'Pago Vencido',
  canceled: 'Cancelada',
  paused: 'Pausada'
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionType | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats>({ users: 0, patients: 0 })
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [changingPlan, setChangingPlan] = useState(false)

  useEffect(() => {
    loadSubscription()
  }, [user])

  const loadSubscription = async () => {
    if (!user?.organization_id) return

    try {
      setLoading(true)
      // Get subscription
      const response = await subscriptionService.getAll({ organization_id: user.organization_id })
      if (response.success && response.data && response.data.length > 0) {
        const sub = response.data[0]
        setSubscription(sub)
        // Default to monthly, since the API doesn't return billing_cycle yet
        setBillingCycle('monthly')
      }

      // TODO: Get actual usage stats from API
      setUsageStats({
        users: 1, // Placeholder
        patients: 15 // Placeholder
      })
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planName: PlanName) => {
    if (!subscription || !user) return

    // No permitir "upgrade" al plan trial
    if (planName === 'trial') {
      alert('No puedes volver al plan de prueba')
      return
    }

    try {
      setChangingPlan(true)
      
      // Llamar al endpoint de checkout
      const response = await subscriptionService.createCheckout({
        plan_name: planName,
        billing_cycle: billingCycle,
        organization_id: user.organization_id,
        user_id: user.id,
        user_email: user.email
      })

      if (response.success && response.data?.checkout_url) {
        // Redirigir a LemonSqueezy checkout
        window.location.href = response.data.checkout_url
      } else {
        alert(response.error || 'Error al crear sesión de pago')
      }
    } catch (error) {
      console.error('Error upgrading:', error)
      alert('Error al actualizar el plan')
    } finally {
      setChangingPlan(false)
    }
  }

  const handleDowngrade = async (planName: PlanName) => {
    if (!subscription) return

    const confirmed = confirm(
      `¿Estás seguro de que deseas cambiar a ${planName}? Los cambios se aplicarán al final del período actual.`
    )
    if (!confirmed) return

    try {
      setChangingPlan(true)
      // TODO: Call API to schedule downgrade
      console.log('Downgrading to:', planName)
      alert('Downgrade programado para el final del período actual')
    } catch (error) {
      console.error('Error downgrading:', error)
      alert('Error al cambiar el plan')
    } finally {
      setChangingPlan(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    const confirmed = confirm(
      '¿Estás seguro de que deseas cancelar tu suscripción? Perderás acceso a las funciones premium al final del período actual.'
    )
    if (!confirmed) return

    try {
      await subscriptionService.cancel(subscription.id)
      loadSubscription()
      alert('Suscripción cancelada correctamente')
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Error al cancelar la suscripción')
    }
  }

  const getUsagePercentage = (used: number, max: number): number => {
    if (max === 999 || max === 999999) return 0 // Unlimited
    return Math.min((used / max) * 100, 100)
  }

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  const currentPlan = subscription ? SUBSCRIPTION_PLANS[subscription.plan.name as PlanName] : SUBSCRIPTION_PLANS.trial
  const PlanIcon = PLAN_ICONS[currentPlan.name as PlanName]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suscripción y Facturación</h1>
          <p className="text-sm text-gray-600 mt-1">Administra tu plan y facturación</p>
        </div>
        {subscription && subscription.status === 'canceled' && (
          <button
            onClick={() => subscriptionService.renew(subscription.id).then(loadSubscription)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reactivar Suscripción
          </button>
        )}
      </div>

      {/* Trial Expiration Alerts */}
      {subscription && subscription.status === 'trial' && subscription.dates?.days_until_expiry !== null && (
        <>
          {/* Trial Expirado */}
          {subscription.dates.days_until_expiry < 0 && (
            <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                    <XCircle className="w-7 h-7 text-red-700" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">
                    🚨 Tu período de prueba ha expirado
                  </h3>
                  <p className="text-red-800 mb-4">
                    Tu período de prueba terminó hace {Math.abs(subscription.dates.days_until_expiry)} días. 
                    Para continuar usando todas las funciones de DoctorCRM, activa un plan de suscripción ahora.
                  </p>
                  <p className="text-sm text-red-700">
                    Elige un plan a continuación para reactivar tu cuenta inmediatamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trial por expirar - 3 días o menos */}
          {subscription.dates.days_until_expiry >= 0 && subscription.dates.days_until_expiry <= 3 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">
                    ⚠️ Tu prueba termina en {subscription.dates.days_until_expiry} {subscription.dates.days_until_expiry === 1 ? 'día' : 'días'}
                  </h3>
                  <p className="text-red-800 mb-2">
                    Tu período de prueba está por terminar. Activa un plan ahora para evitar interrupciones en tu servicio.
                  </p>
                  <p className="text-sm text-red-700">
                    Elige el plan que mejor se adapte a tus necesidades a continuación.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trial advertencia - 4 a 7 días */}
          {subscription.dates.days_until_expiry > 3 && subscription.dates.days_until_expiry <= 7 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-yellow-900 mb-1">
                    Tu prueba termina en {subscription.dates.days_until_expiry} días
                  </h3>
                  <p className="text-sm text-yellow-800">
                    Explora nuestros planes y elige el que mejor se adapte a tu práctica médica.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Current Plan Card */}
      {subscription && (
        <div className={`border-2 rounded-xl p-6 ${
          subscription.status === 'trial' && subscription.dates?.days_until_expiry !== null && subscription.dates.days_until_expiry < 0
            ? 'bg-red-50 border-red-300'
            : PLAN_BG_COLORS[currentPlan.name as PlanName]
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 bg-white rounded-lg ${
                subscription.status === 'trial' && subscription.dates?.days_until_expiry !== null && subscription.dates.days_until_expiry < 0
                  ? 'text-red-600'
                  : PLAN_COLORS[currentPlan.name as PlanName]
              }`}>
                <PlanIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Plan {currentPlan.displayName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    subscription.status === 'trial' && subscription.dates?.days_until_expiry !== null && subscription.dates.days_until_expiry < 0
                      ? 'bg-red-100 text-red-800'
                      : STATUS_COLORS[subscription.status as keyof typeof STATUS_COLORS]
                  }`}>
                    {subscription.status === 'trial' && subscription.dates?.days_until_expiry !== null && subscription.dates.days_until_expiry < 0
                      ? 'Expirado'
                      : STATUS_LABELS[subscription.status as keyof typeof STATUS_LABELS]}
                  </span>
                  {subscription.is_trial && subscription.dates?.days_until_expiry !== null && (
                    <>
                      {subscription.dates.days_until_expiry < 0 ? (
                        <span className="text-sm font-semibold text-red-600">
                          • Expirado hace {Math.abs(subscription.dates.days_until_expiry)} días
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">
                          • Prueba por {subscription.dates.days_until_expiry} días más
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(currentPlan.price[billingCycle])}
              </div>
              <div className="text-sm text-gray-600">
                {billingCycle === 'monthly' ? 'por mes' : 'por año'}
              </div>
            </div>
          </div>

          {/* Renewal Info */}
          {subscription.is_active && subscription.dates.current_period_end && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 rounded-lg p-3">
              <Calendar className="w-4 h-4" />
              <span>
                Se renueva el {new Date(subscription.dates.current_period_end).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}

          {/* Usage Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Usuarios</span>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-gray-900">{usageStats.users}</span>
                  <span className="text-sm text-gray-500">
                    de {currentPlan.limits.users === 999 ? '∞' : currentPlan.limits.users}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${getUsageColor(getUsagePercentage(usageStats.users, currentPlan.limits.users))}`}
                    style={{ width: `${getUsagePercentage(usageStats.users, currentPlan.limits.users)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Pacientes</span>
                <UserPlus className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-gray-900">{usageStats.patients}</span>
                  <span className="text-sm text-gray-500">
                    de {currentPlan.limits.patients === 999999 ? '∞' : currentPlan.limits.patients}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${getUsageColor(getUsagePercentage(usageStats.patients, currentPlan.limits.patients))}`}
                    style={{ width: `${getUsagePercentage(usageStats.patients, currentPlan.limits.patients)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {getUsagePercentage(usageStats.users, currentPlan.limits.users) >= 90 && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Límite de usuarios casi alcanzado</p>
                <p className="text-sm text-red-700 mt-1">
                  Considera actualizar tu plan para agregar más usuarios.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            billingCycle === 'monthly'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            billingCycle === 'yearly'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Anual
          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
            Ahorra 17%
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
          const Icon = PLAN_ICONS[plan.name as PlanName]
          const isCurrent = subscription?.plan.name === plan.name
          const canUpgradeToPlan = subscription ? canUpgrade(subscription.plan.name as PlanName, plan.name) : false
          const canDowngradeToPlan = subscription ? canDowngrade(subscription.plan.name as PlanName, plan.name) : false

          return (
            <div
              key={plan.name}
              className={`border-2 rounded-xl p-6 transition-all ${
                isCurrent
                  ? `${PLAN_BG_COLORS[plan.name as PlanName]} shadow-lg scale-105`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              } ${plan.popular ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
            >
              {/* Plan Header */}
              <div className="text-center mb-6">
                {plan.popular && (
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-3">
                    MÁS POPULAR
                  </span>
                )}
                <div className={`inline-flex p-3 rounded-lg mb-3 ${PLAN_COLORS[plan.name as PlanName]} bg-white`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.displayName}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.price[billingCycle])}
                  </span>
                  {plan.name !== 'trial' && (
                    <span className="text-gray-600">/{billingCycle === 'monthly' ? 'mes' : 'año'}</span>
                  )}
                </div>
                {billingCycle === 'yearly' && plan.name !== 'trial' && (
                  <p className="text-sm text-green-600 font-medium">
                    Ahorras {formatPrice(plan.price.monthly * 12 - plan.price.yearly)} al año
                  </p>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${PLAN_COLORS[plan.name]}`} />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-200">
                {isCurrent ? (
                  <button disabled className="w-full py-2 bg-gray-100 text-gray-500 rounded-lg font-medium">
                    Plan Actual
                  </button>
                ) : canUpgradeToPlan ? (
                  <button
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={changingPlan}
                    className={`w-full py-2 ${PLAN_COLORS[plan.name]} bg-white border-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50`}
                  >
                    {changingPlan ? 'Procesando...' : 'Actualizar Plan'}
                  </button>
                ) : canDowngradeToPlan ? (
                  <button
                    onClick={() => handleDowngrade(plan.name)}
                    disabled={changingPlan}
                    className="w-full py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {changingPlan ? 'Procesando...' : 'Cambiar a este plan'}
                  </button>
                ) : (
                  <button disabled className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg font-medium">
                    No disponible
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Cancel Subscription */}
      {subscription && subscription.is_active && subscription.plan.name !== 'trial' && (
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900">Cancelar Suscripción</h3>
              <p className="text-sm text-red-700 mt-1">
                Tu suscripción se mantendrá activa hasta el final del período actual.
              </p>
            </div>
            <button
              onClick={handleCancelSubscription}
              className="px-4 py-2 text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Cancelar Plan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
