'use client'

import { XCircleIcon } from '@heroicons/react/24/outline'
import { type PatientMedication } from '@/lib/services'

interface MedicationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  medication: PatientMedication | null
}

export default function MedicationDetailsModal({
  isOpen,
  onClose,
  medication
}: MedicationDetailsModalProps) {
  if (!isOpen || !medication) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-semibold text-gray-900">
            Detalles del Medicamento
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Nombre del Medicamento */}
          <div className="pb-4 border-b border-gray-200">
            <h4 className="text-2xl font-bold text-gray-900">
              {medication.medication.name}
            </h4>
            {medication.medication.code && (
              <p className="mt-1 text-sm text-gray-500">
                Código {medication.medication.system}: {medication.medication.code}
              </p>
            )}
          </div>

          {/* Estado y PRN */}
          <div className="grid grid-cols-2 gap-3">
            <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Estado</span>
              <p className="mt-1 text-base text-blue-900 font-semibold capitalize">{medication.status}</p>
            </div>
            <div className="px-4 py-2 bg-purple-50 rounded-lg border border-purple-100">
              <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">PRN</span>
              <p className="mt-1 text-base text-purple-900 font-semibold">
                {medication.dosage.is_prn ? 'Sí - Según Necesidad' : 'No'}
              </p>
            </div>
          </div>

          {/* Información de Dosificación - SIEMPRE MOSTRAR */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
            <h5 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <span>�</span> Información de Dosificación
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Dosis</p>
                <p className="text-base text-blue-900">{medication.dosage.dose || <span className="text-gray-400 italic">No especificada</span>}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Vía de Administración</p>
                <p className="text-base text-blue-900">{medication.dosage.route || <span className="text-gray-400 italic">No especificada</span>}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Frecuencia</p>
                <p className="text-base text-blue-900">{medication.dosage.frequency || <span className="text-gray-400 italic">No especificada</span>}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Instrucciones de Dosificación</p>
              <p className="text-sm text-blue-800">{medication.dosage.text || <span className="text-gray-400 italic">Sin instrucciones específicas</span>}</p>
            </div>
          </div>

          {/* Razón para Tomar - SIEMPRE MOSTRAR */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h5 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
              <span>🎯</span> Razón para Tomar
            </h5>
            <p className="text-sm text-green-800">
              {medication.reason.text || <span className="text-gray-400 italic">No especificada</span>}
            </p>
            {medication.reason.code && (
              <p className="mt-1 text-xs text-green-700">Código: {medication.reason.code}</p>
            )}
          </div>

          {/* Fechas - SIEMPRE MOSTRAR */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📅</span> Período de Tratamiento
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Fecha de Inicio</p>
                <p className="text-base text-gray-900">
                  {medication.timing.start_date ? (
                    new Date(medication.timing.start_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  ) : (
                    <span className="text-gray-400 italic">No especificada</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Fecha de Fin</p>
                <p className="text-base text-gray-900">
                  {medication.timing.end_date ? (
                    new Date(medication.timing.end_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  ) : (
                    <span className="text-gray-400 italic">No especificada</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Prescriptor y Farmacia - SIEMPRE MOSTRAR */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <h5 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
              <span>👨‍⚕️</span> Información del Prescriptor y Farmacia
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-1">Prescriptor</p>
                <p className="text-base text-indigo-900">
                  {medication.prescriber_name || <span className="text-gray-400 italic">No especificado</span>}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-1">Farmacia</p>
                <p className="text-base text-indigo-900">
                  {medication.pharmacy || <span className="text-gray-400 italic">No especificada</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Recargas - SIEMPRE MOSTRAR */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h5 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <span>🔄</span> Recargas
            </h5>
            <p className="text-2xl font-bold text-amber-900">
              {medication.refills_remaining !== null && medication.refills_remaining !== undefined 
                ? medication.refills_remaining 
                : <span className="text-base font-normal text-gray-400 italic">No especificadas</span>
              }
            </p>
          </div>

          {/* Notas - SIEMPRE MOSTRAR */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h5 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <span>📝</span> Notas Adicionales
            </h5>
            <p className="text-sm text-yellow-800 whitespace-pre-wrap">
              {medication.notes || <span className="text-gray-400 italic">Sin notas adicionales</span>}
            </p>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="font-medium">Creado:</span> {new Date(medication.created_at).toLocaleDateString('es-ES')}
              </div>
              <div>
                <span className="font-medium">Actualizado:</span> {new Date(medication.updated_at).toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
