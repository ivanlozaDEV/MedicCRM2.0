'use client'

import { AlertCircle, CheckCircle2, TrendingUp, TrendingDown, X } from 'lucide-react'
import { SubscriptionPlan, BillingCycle, formatPrice } from '@/lib/subscriptionPlans'

interface SubscriptionChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  currentPlan: SubscriptionPlan
  newPlan: SubscriptionPlan
  billingCycle: BillingCycle
  isUpgrade: boolean
  renewalDate?: string
  isProcessing: boolean
  currentUsage?: {
    users: number
    patients: number
  }
}

export default function SubscriptionChangeModal({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  newPlan,
  billingCycle,
  isUpgrade,
  renewalDate,
  isProcessing,
  currentUsage
}: SubscriptionChangeModalProps) {
  if (!isOpen) return null

  const currentPrice = currentPlan.price[billingCycle]
  const newPrice = newPlan.price[billingCycle]
  const priceDifference = newPrice - currentPrice
  
  // Check if current usage exceeds new plan limits (for downgrades)
  const usersWillExceed = currentUsage ? currentUsage.users > newPlan.limits.users : false
  const patientsWillExceed = currentUsage ? currentUsage.patients > newPlan.limits.patients : false
  const hasLimitIssues = !isUpgrade && (usersWillExceed || patientsWillExceed)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isUpgrade ? (
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {isUpgrade ? 'Actualizar Plan' : 'Cambiar Plan'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Plan Change Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen del cambio</h3>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Plan actual</p>
                <p className="text-lg font-bold text-gray-900">{currentPlan.displayName}</p>
                <p className="text-sm text-gray-600">
                  {formatPrice(currentPrice)}/{billingCycle === 'monthly' ? 'mes' : 'año'}
                </p>
              </div>
              <div className="px-3">
                <div className={`p-2 rounded-full ${isUpgrade ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {isUpgrade ? (
                    <TrendingUp className={`w-4 h-4 ${isUpgrade ? 'text-green-600' : 'text-orange-600'}`} />
                  ) : (
                    <TrendingDown className={`w-4 h-4 ${isUpgrade ? 'text-green-600' : 'text-orange-600'}`} />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Nuevo plan</p>
                <p className="text-lg font-bold text-gray-900">{newPlan.displayName}</p>
                <p className="text-sm text-gray-600">
                  {formatPrice(newPrice)}/{billingCycle === 'monthly' ? 'mes' : 'año'}
                </p>
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Información de pago</h3>
            
            {isUpgrade ? (
              <>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Diferencia de precio:</span>
                    <span className="font-semibold text-gray-900">
                      +{formatPrice(Math.abs(priceDifference))}/{billingCycle === 'monthly' ? 'mes' : 'año'}
                    </span>
                  </div>
                  {renewalDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Próxima facturación:</span>
                      <span className="font-medium text-gray-900">{renewalDate}</span>
                    </div>
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Prorrateo automático:</strong> Se te cobrará la diferencia proporcional por los días restantes del período actual. Tu próxima factura será el {renewalDate || 'día de renovación'} por {formatPrice(newPrice)}.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Diferencia de precio:</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(Math.abs(priceDifference))}/{billingCycle === 'monthly' ? 'mes' : 'año'}
                    </span>
                  </div>
                  {renewalDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cambio efectivo:</span>
                      <span className="font-medium text-gray-900">{renewalDate}</span>
                    </div>
                  )}
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800">
                    <strong>Cambio al final del período:</strong> Continuarás con tu plan {currentPlan.displayName} hasta el {renewalDate || 'final del período'}. Después se activará el plan {newPlan.displayName} a {formatPrice(newPrice)}/{billingCycle === 'monthly' ? 'mes' : 'año'}.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Features Comparison */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Cambios en tu plan</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Limits Comparison */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Usuarios</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-lg font-bold ${isUpgrade ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {currentPlan.limits.users}
                  </span>
                  {currentPlan.limits.users !== newPlan.limits.users && (
                    <>
                      <span className="text-gray-400">→</span>
                      <span className={`text-lg font-bold ${isUpgrade ? 'text-green-600' : usersWillExceed ? 'text-red-600' : 'text-orange-600'}`}>
                        {newPlan.limits.users}
                      </span>
                    </>
                  )}
                </div>
                {currentUsage && !isUpgrade && (
                  <p className={`text-xs mt-1 ${usersWillExceed ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    Uso actual: {currentUsage.users} {usersWillExceed && '⚠️ Excede el límite'}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Pacientes</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-lg font-bold ${isUpgrade ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {currentPlan.limits.patients}
                  </span>
                  {currentPlan.limits.patients !== newPlan.limits.patients && (
                    <>
                      <span className="text-gray-400">→</span>
                      <span className={`text-lg font-bold ${isUpgrade ? 'text-green-600' : patientsWillExceed ? 'text-red-600' : 'text-orange-600'}`}>
                        {newPlan.limits.patients}
                      </span>
                    </>
                  )}
                </div>
                {currentUsage && !isUpgrade && (
                  <p className={`text-xs mt-1 ${patientsWillExceed ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    Uso actual: {currentUsage.patients} {patientsWillExceed && '⚠️ Excede el límite'}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Almacenamiento</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-lg font-bold ${isUpgrade ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {currentPlan.limits.storageGB} GB
                  </span>
                  {currentPlan.limits.storageGB !== newPlan.limits.storageGB && (
                    <>
                      <span className="text-gray-400">→</span>
                      <span className={`text-lg font-bold ${isUpgrade ? 'text-green-600' : 'text-orange-600'}`}>
                        {newPlan.limits.storageGB} GB
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Warning/Info */}
          {!isUpgrade && hasLimitIssues && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">⚠️ No puedes cambiar a este plan</p>
                <p className="mb-2">
                  Tu uso actual excede los límites del plan {newPlan.displayName}:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {usersWillExceed && currentUsage && (
                    <li>
                      Tienes <strong>{currentUsage.users} usuarios</strong> pero el plan solo permite <strong>{newPlan.limits.users}</strong>. 
                      Debes desactivar <strong>{currentUsage.users - newPlan.limits.users}</strong> usuario(s).
                    </li>
                  )}
                  {patientsWillExceed && currentUsage && (
                    <li>
                      Tienes <strong>{currentUsage.patients} pacientes</strong> pero el plan solo permite <strong>{newPlan.limits.patients}</strong>. 
                      Debes archivar <strong>{currentUsage.patients - newPlan.limits.patients}</strong> paciente(s).
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
          
          {!isUpgrade && !hasLimitIssues && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Importante</p>
                <p>
                  Asegúrate de que tu uso actual no exceda los límites del nuevo plan. 
                  Si tienes más usuarios o pacientes, deberás ajustarlos antes del cambio.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-6 py-2 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isUpgrade
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Procesando...
              </span>
            ) : (
              `Confirmar ${isUpgrade ? 'Actualización' : 'Cambio'}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
