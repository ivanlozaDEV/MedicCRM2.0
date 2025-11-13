'use client'

import { XCircleIcon } from '@heroicons/react/24/outline'
import { type PatientCondition } from '@/lib/services'

interface ConditionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  condition: PatientCondition | null
}

export default function ConditionDetailsModal({
  isOpen,
  onClose,
  condition,
}: ConditionDetailsModalProps) {
  if (!isOpen || !condition) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Activa',
      recurrence: 'Recurrencia',
      relapse: 'Recaída',
      inactive: 'Inactiva',
      remission: 'Remisión',
      resolved: 'Resuelta',
    }
    return labels[status] || status
  }

  const getVerificationLabel = (status: string) => {
    const labels: Record<string, string> = {
      unconfirmed: 'No confirmada',
      provisional: 'Provisional',
      differential: 'Diferencial',
      confirmed: 'Confirmada',
      refuted: 'Refutada',
      'entered-in-error': 'Error de entrada',
    }
    return labels[status] || status
  }

  const getSeverityLabel = (severity?: string) => {
    if (!severity) return 'No especificado'
    const labels: Record<string, string> = {
      mild: 'Leve',
      moderate: 'Moderada',
      severe: 'Grave',
    }
    return labels[severity] || severity
  }

  const getCategoryLabel = (category?: string) => {
    if (!category) return 'No especificado'
    const labels: Record<string, string> = {
      'problem-list-item': 'Lista de Problemas',
      'encounter-diagnosis': 'Diagnóstico de Encuentro',
    }
    return labels[category] || category
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-semibold text-gray-900">Detalles de la Condición</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3">
              Información Básica
            </h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-purple-800 dark:text-purple-200">Condición</dt>
                <dd className="text-sm text-purple-900 dark:text-purple-100">{condition.condition.name}</dd>
              </div>
              {condition.condition.code && (
                <div>
                  <dt className="text-sm font-medium text-purple-800 dark:text-purple-200">Código</dt>
                  <dd className="text-sm text-purple-900 dark:text-purple-100">
                    {condition.condition.code}
                    {condition.condition.system && ` (${condition.condition.system})`}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Estado Clínico */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Estado Clínico
            </h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-blue-800 dark:text-blue-200">Estado Clínico</dt>
                <dd className="text-sm text-blue-900 dark:text-blue-100">
                  {getStatusLabel(condition.clinical_status)}
                  {condition.is_active && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Activa
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-blue-800 dark:text-blue-200">Verificación</dt>
                <dd className="text-sm text-blue-900 dark:text-blue-100">
                  {getVerificationLabel(condition.verification_status)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-blue-800 dark:text-blue-200">Severidad</dt>
                <dd className="text-sm text-blue-900 dark:text-blue-100">
                  {getSeverityLabel(condition.severity)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-blue-800 dark:text-blue-200">Categoría</dt>
                <dd className="text-sm text-blue-900 dark:text-blue-100">
                  {getCategoryLabel(condition.category)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Cronología */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">
              Cronología
            </h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-green-800 dark:text-green-200">Fecha de Inicio</dt>
                <dd className="text-sm text-green-900 dark:text-green-100">
                  {formatDate(condition.dates.onset)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-green-800 dark:text-green-200">Fecha de Resolución</dt>
                <dd className="text-sm text-green-900 dark:text-green-100">
                  {formatDate(condition.dates.abatement)}
                </dd>
              </div>
              {condition.dates.duration_days !== null && condition.dates.duration_days !== undefined && (
                <div>
                  <dt className="text-sm font-medium text-green-800 dark:text-green-200">Duración</dt>
                  <dd className="text-sm text-green-900 dark:text-green-100">
                    {condition.dates.duration_days} días
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-green-800 dark:text-green-200">Fecha de Registro</dt>
                <dd className="text-sm text-green-900 dark:text-green-100">
                  {formatDate(condition.dates.recorded)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Detalles Clínicos */}
          {(condition.clinical_info.body_site || condition.clinical_info.stage) && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-3">
                Detalles Clínicos
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {condition.clinical_info.body_site && (
                  <div>
                    <dt className="text-sm font-medium text-amber-800 dark:text-amber-200">Sitio Anatómico</dt>
                    <dd className="text-sm text-amber-900 dark:text-amber-100">
                      {condition.clinical_info.body_site}
                    </dd>
                  </div>
                )}
                {condition.clinical_info.stage && (
                  <div>
                    <dt className="text-sm font-medium text-amber-800 dark:text-amber-200">Etapa/Grado</dt>
                    <dd className="text-sm text-amber-900 dark:text-amber-100">
                      {condition.clinical_info.stage}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Notas Clínicas */}
          {condition.notes && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Notas Clínicas
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {condition.notes}
              </p>
            </div>
          )}

          {/* Registrador */}
          {condition.recorder_name && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                Información del Registro
              </h4>
              <p className="text-sm text-indigo-900 dark:text-indigo-100">
                <span className="font-medium">Registrado por:</span> {condition.recorder_name}
              </p>
            </div>
          )}

          {/* Metadatos */}
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between pt-4 border-t">
            <span>
              Creado: {new Date(condition.created_at).toLocaleString('es-ES')}
            </span>
            <span>
              Actualizado: {new Date(condition.updated_at).toLocaleString('es-ES')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
