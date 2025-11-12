'use client'

import { useState, useEffect } from 'react'
import { patientAllergyService, type PatientAllergy } from '@/lib/services'
import { usePermissions, PermissionGuard } from '@/lib/hooks/usePermissions'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import AllergyFormModal from './AllergyFormModal'
import AllergyDetailsModal from './AllergyDetailsModal'

interface AllergiesTabProps {
  patientId: number
}

export default function AllergiesTab({ patientId }: AllergiesTabProps) {
  const { hasPermission } = usePermissions()
  const [allergies, setAllergies] = useState<PatientAllergy[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [editingAllergy, setEditingAllergy] = useState<PatientAllergy | null>(null)
  const [viewingAllergy, setViewingAllergy] = useState<PatientAllergy | null>(null)

  useEffect(() => {
    fetchAllergies()
  }, [patientId])

  const fetchAllergies = async () => {
    try {
      setLoading(true)
      const response = await patientAllergyService.getAll(patientId)
      if (response.success) {
        setAllergies(response.data)
      }
    } catch (error) {
      console.error('Error fetching allergies:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingAllergy(null)
    setIsModalOpen(true)
  }

  const openEditModal = (allergy: PatientAllergy) => {
    setEditingAllergy(allergy)
    setIsModalOpen(true)
  }

  const openViewModal = (allergy: PatientAllergy) => {
    setViewingAllergy(allergy)
    setIsDetailsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAllergy(null)
  }

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setViewingAllergy(null)
  }

  const handleSuccess = async () => {
    await fetchAllergies()
  }

  const handleDelete = async (allergyId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta alergia?')) return

    try {
      const response = await patientAllergyService.delete(allergyId)
      if (response.success) {
        await fetchAllergies()
      }
    } catch (error) {
      console.error('Error deleting allergy:', error)
    }
  }

  const getSeverityBadge = (severity?: string) => {
    const badges = {
      mild: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      severe: 'bg-red-100 text-red-800'
    }
    const labels = {
      mild: 'Leve',
      moderate: 'Moderada',
      severe: 'Severa'
    }
    return severity ? (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[severity as keyof typeof badges]}`}>
        {labels[severity as keyof typeof labels]}
      </span>
    ) : null
  }

  const getCriticalityBadge = (criticality?: string) => {
    const badges = {
      low: 'bg-blue-100 text-blue-800',
      high: 'bg-red-100 text-red-800',
      'unable-to-assess': 'bg-gray-100 text-gray-800'
    }
    const labels = {
      low: 'Baja',
      high: 'Alta',
      'unable-to-assess': 'No evaluable'
    }
    return criticality ? (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[criticality as keyof typeof badges]}`}>
        {labels[criticality as keyof typeof labels]}
      </span>
    ) : null
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      active: <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />,
      inactive: <XCircleIcon className="h-5 w-5 text-gray-400" />,
      resolved: <CheckCircleIcon className="h-5 w-5 text-green-500" />
    }
    return icons[status as keyof typeof icons] || null
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Activa',
      inactive: 'Inactiva',
      resolved: 'Resuelta'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getVerificationLabel = (status: string) => {
    const labels = {
      unconfirmed: 'No confirmada',
      confirmed: 'Confirmada',
      refuted: 'Refutada',
      'entered-in-error': 'Error de entrada'
    }
    return labels[status as keyof typeof labels] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Cargando alergias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Alergias del Paciente</h3>
          <p className="mt-1 text-sm text-gray-500">
            Registro de alergias y reacciones adversas según estándares FHIR
          </p>
        </div>
        <PermissionGuard permission="patient_allergies.create">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Agregar Alergia
          </button>
        </PermissionGuard>
      </div>

      {/* Allergies List */}
      {allergies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay alergias registradas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza agregando la primera alergia del paciente.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {allergies.map((allergy) => (
              <li key={allergy.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getStatusIcon(allergy.clinical_status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {allergy.allergen.name}
                          </p>
                          {getSeverityBadge(allergy.reaction.severity)}
                          {getCriticalityBadge(allergy.criticality)}
                        </div>
                        {allergy.reaction.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            <span className="font-medium">Reacción:</span> {allergy.reaction.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            <span className="font-medium">Estado:</span> {getStatusLabel(allergy.clinical_status)}
                          </span>
                          <span>
                            <span className="font-medium">Verificación:</span> {getVerificationLabel(allergy.verification_status)}
                          </span>
                          {allergy.dates.onset && (
                            <span>
                              <span className="font-medium">Inicio:</span>{' '}
                              {new Date(allergy.dates.onset).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                        {allergy.notes && (
                          <p className="mt-1 text-xs text-gray-400 italic">{allergy.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => openViewModal(allergy)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <PermissionGuard permission="patient_allergies.update">
                        <button
                          onClick={() => openEditModal(allergy)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar alergia"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="patient_allergies.delete">
                        <button
                          onClick={() => handleDelete(allergy.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar alergia"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modals */}
      <AllergyFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
        patientId={patientId}
        editingAllergy={editingAllergy}
      />

      <AllergyDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        allergy={viewingAllergy}
      />
    </div>
  )
}
