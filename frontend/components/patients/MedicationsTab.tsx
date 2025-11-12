'use client'

import { useState, useEffect } from 'react'
import { patientMedicationService, type PatientMedication } from '@/lib/services'
import { usePermissions, PermissionGuard } from '@/lib/hooks/usePermissions'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
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
                  {/* Nombre del medicamento */}
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {medication.medication.name}
                  </h4>

                  {/* INFORMACIÓN BÁSICA - Solo dosis, vía y frecuencia */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Dosis:</span>
                      <span className={`ml-2 ${medication.dosage.dose ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {medication.dosage.dose || 'No especificada'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Vía:</span>
                      <span className={`ml-2 ${medication.dosage.route ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {medication.dosage.route || 'No especificada'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Frecuencia:</span>
                      <span className={`ml-2 ${medication.dosage.frequency ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {medication.dosage.frequency || 'No especificada'}
                      </span>
                    </div>
                  </div>
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
