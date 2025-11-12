'use client'

import { useState, useEffect } from 'react'
import { patientMedicationService, type PatientMedication } from '@/lib/services'
import { usePermissions, PermissionGuard } from '@/lib/hooks/usePermissions'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import MedicationFormModal from './MedicationFormModal'
import MedicationDetailsModal from './MedicationDetailsModal'

interface MedicationsTabProps {
  patientId: number
}

export default function MedicationsTab({ patientId }: MedicationsTabProps) {
  const { hasPermission } = usePermissions()
  const [medications, setMedications] = useState<PatientMedication[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<PatientMedication | null>(null)
  const [viewingMedication, setViewingMedication] = useState<PatientMedication | null>(null)

  useEffect(() => {
    fetchMedications()
  }, [patientId])

  const fetchMedications = async () => {
    try {
      setLoading(true)
      const response = await patientMedicationService.getAll(patientId)
      if (response.success) {
        setMedications(response.data)
      }
    } catch (error) {
      console.error('Error fetching medications:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (medication?: PatientMedication) => {
    setEditingMedication(medication || null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMedication(null)
  }

  const openDetailsModal = (medication: PatientMedication) => {
    setViewingMedication(medication)
    setIsDetailsModalOpen(true)
  }

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setViewingMedication(null)
  }

  const handleModalSuccess = async () => {
    await fetchMedications()
  }

  const handleDelete = async (medicationId: number) => {
    if (!confirm('¿Está seguro que desea eliminar este medicamento?')) {
      return
    }

    try {
      await patientMedicationService.delete(patientId, medicationId)
      await fetchMedications()
    } catch (error) {
      console.error('Error deleting medication:', error)
      alert('Error al eliminar medicamento')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Activo' },
      completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircleIcon, label: 'Completado' },
      stopped: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Detenido' },
      'on-hold': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'En Pausa' }
    }

    const badge = badges[status] || badges.active
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    )
  }

  const getCategoryBadge = (category?: string) => {
    if (!category) return null

    const colors: Record<string, string> = {
      antibiotic: 'bg-purple-100 text-purple-800',
      analgesic: 'bg-blue-100 text-blue-800',
      antihypertensive: 'bg-red-100 text-red-800',
      antidiabetic: 'bg-green-100 text-green-800',
      antilipidemic: 'bg-yellow-100 text-yellow-800',
      antidepressant: 'bg-indigo-100 text-indigo-800',
      gastrointestinal: 'bg-orange-100 text-orange-800',
      anticoagulant: 'bg-pink-100 text-pink-800',
      bronchodilator: 'bg-cyan-100 text-cyan-800',
      thyroid: 'bg-teal-100 text-teal-800',
      antihistamine: 'bg-lime-100 text-lime-800'
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
        {category}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Medicamentos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Medicamentos actuales y pasados siguiendo FHIR MedicationStatement
          </p>
        </div>
        <PermissionGuard permission="patient_medications.create">
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Agregar Medicamento
          </button>
        </PermissionGuard>
      </div>

      {/* Medications List */}
      {medications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No hay medicamentos registrados</p>
          <PermissionGuard permission="patient_medications.create">
            <button
              onClick={() => openModal()}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Agregar primer medicamento
            </button>
          </PermissionGuard>
        </div>
      ) : (
        <div className="grid gap-4">
          {medications.map((medication) => (
            <div
              key={medication.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Encabezado con nombre y estado */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {medication.medication.name}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(medication.status)}
                        {medication.dosage.is_prn && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            PRN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* INFORMACIÓN BÁSICA - SIEMPRE VISIBLE */}
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="font-semibold text-blue-900">Dosis:</span>
                        <span className={`ml-2 ${medication.dosage.dose ? 'text-blue-700' : 'text-gray-400 italic'}`}>
                          {medication.dosage.dose || 'No especificada'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-900">Vía:</span>
                        <span className={`ml-2 ${medication.dosage.route ? 'text-blue-700' : 'text-gray-400 italic'}`}>
                          {medication.dosage.route || 'No especificada'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-900">Frecuencia:</span>
                        <span className={`ml-2 ${medication.dosage.frequency ? 'text-blue-700' : 'text-gray-400 italic'}`}>
                          {medication.dosage.frequency || 'No especificada'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Instrucciones de dosificación destacadas */}
                  {medication.dosage.text && (
                    <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="text-sm">
                        <span className="font-semibold text-green-900">Instrucciones:</span>
                        <p className="mt-1 text-green-700">{medication.dosage.text}</p>
                      </div>
                    </div>
                  )}

                  {/* Información adicional (solo si existe) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {medication.reason.text && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Razón:</span>
                        <span className="ml-2 text-gray-600">{medication.reason.text}</span>
                      </div>
                    )}
                    {medication.timing.start_date && (
                      <div>
                        <span className="font-medium text-gray-700">Fecha Inicio:</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(medication.timing.start_date).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                    {medication.timing.end_date && (
                      <div>
                        <span className="font-medium text-gray-700">Fecha Fin:</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(medication.timing.end_date).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                    {medication.prescriber_name && (
                      <div>
                        <span className="font-medium text-gray-700">Prescriptor:</span>
                        <span className="ml-2 text-gray-600">{medication.prescriber_name}</span>
                      </div>
                    )}
                    {medication.pharmacy && (
                      <div>
                        <span className="font-medium text-gray-700">Farmacia:</span>
                        <span className="ml-2 text-gray-600">{medication.pharmacy}</span>
                      </div>
                    )}
                    {medication.refills_remaining !== null && medication.refills_remaining !== undefined && (
                      <div>
                        <span className="font-medium text-gray-700">Recargas Restantes:</span>
                        <span className="ml-2 text-gray-600">{medication.refills_remaining}</span>
                      </div>
                    )}
                    {medication.notes && (
                      <div className="md:col-span-2 mt-2 p-2 bg-yellow-50 rounded border border-yellow-100">
                        <span className="font-medium text-yellow-900">Notas:</span>
                        <p className="mt-1 text-yellow-700 text-xs">{medication.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Información técnica al final */}
                  {medication.medication.code && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                      <span className="font-medium">Código:</span> {medication.medication.code}
                      {medication.medication.system && ` (${medication.medication.system})`}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openDetailsModal(medication)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Ver detalles completos"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <PermissionGuard permission="patient_medications.update">
                    <button
                      onClick={() => openModal(medication)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar medicamento"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permission="patient_medications.delete">
                    <button
                      onClick={() => handleDelete(medication.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar medicamento"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <MedicationFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
        patientId={patientId}
        editingMedication={editingMedication}
      />

      <MedicationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        medication={viewingMedication}
      />
    </div>
  )
}
