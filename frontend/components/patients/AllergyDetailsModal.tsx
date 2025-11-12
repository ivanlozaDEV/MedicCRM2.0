'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import type { PatientAllergy } from '@/lib/services'

interface AllergyDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  allergy: PatientAllergy | null
}

export default function AllergyDetailsModal({
  isOpen,
  onClose,
  allergy
}: AllergyDetailsModalProps) {
  if (!isOpen || !allergy) return null

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Activa',
      inactive: 'Inactiva',
      resolved: 'Resuelta'
    }
    return labels[status] || status
  }

  const getVerificationLabel = (status: string) => {
    const labels: Record<string, string> = {
      unconfirmed: 'No confirmada',
      confirmed: 'Confirmada',
      refuted: 'Refutada',
      'entered-in-error': 'Error de entrada'
    }
    return labels[status] || status
  }

  const getSeverityLabel = (severity?: string) => {
    if (!severity) return 'No especificado'
    const labels: Record<string, string> = {
      mild: 'Leve',
      moderate: 'Moderada',
      severe: 'Severa'
    }
    return labels[severity] || severity
  }

  const getCriticalityLabel = (criticality?: string) => {
    if (!criticality) return 'No especificado'
    const labels: Record<string, string> = {
      low: 'Baja',
      high: 'Alta',
      'unable-to-assess': 'No evaluable'
    }
    return labels[criticality] || criticality
  }

  const formatDate = (date?: string) => {
    if (!date) return 'No especificado'
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return date
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Detalles de la Alergia
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Información completa según estándares FHIR
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Allergen Information */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center">
              ⚠️ Alérgeno
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Nombre</p>
                <p className="text-base text-red-900 dark:text-red-100 font-semibold">
                  {allergy.allergen.name}
                </p>
              </div>
              {allergy.allergen.code && (
                <div className="pt-2 border-t border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Código</p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {allergy.allergen.code}
                    {allergy.allergen.system && (
                      <span className="ml-2 text-xs">({allergy.allergen.system})</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Status & Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                📋 Estado Clínico
              </h3>
              <p className="text-base text-blue-900 dark:text-blue-100 font-medium">
                {getStatusLabel(allergy.clinical_status)}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center">
                ✓ Verificación
              </h3>
              <p className="text-base text-purple-900 dark:text-purple-100 font-medium">
                {getVerificationLabel(allergy.verification_status)}
              </p>
            </div>
          </div>

          {/* Reaction Information */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center">
              🔥 Reacción
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Descripción</p>
                <p className="text-sm text-orange-900 dark:text-orange-100">
                  {allergy.reaction.description || 'No especificado'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Severidad</p>
                  <p className="text-sm text-orange-900 dark:text-orange-100">
                    {getSeverityLabel(allergy.reaction.severity)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Manifestación</p>
                  <p className="text-sm text-orange-900 dark:text-orange-100">
                    {allergy.reaction.manifestation || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Criticality */}
          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
            <h3 className="text-sm font-semibold text-pink-900 dark:text-pink-100 mb-2 flex items-center">
              ⚡ Criticidad (Riesgo Futuro)
            </h3>
            <p className="text-base text-pink-900 dark:text-pink-100 font-medium">
              {getCriticalityLabel(allergy.criticality)}
            </p>
          </div>

          {/* Dates */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
              📅 Fechas
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Fecha de Inicio</p>
                <p className="text-sm text-green-900 dark:text-green-100">
                  {formatDate(allergy.dates.onset)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {allergy.notes && (
            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                📝 Notas Adicionales
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {allergy.notes}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex flex-wrap gap-4">
              {allergy.created_at && (
                <div>
                  <span className="font-medium">Creado:</span> {formatDate(allergy.created_at)}
                </div>
              )}
              {allergy.updated_at && (
                <div>
                  <span className="font-medium">Actualizado:</span> {formatDate(allergy.updated_at)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900/20 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
