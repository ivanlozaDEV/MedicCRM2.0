'use client'

import { useState, useEffect } from 'react'
import { patientConditionService, type PatientCondition } from '@/lib/services'
import { usePermissions, PermissionGuard } from '@/lib/hooks/usePermissions'
import {
  PlusIcon,
  HeartIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import ConditionFormModal from './ConditionFormModal'
import ConditionDetailsModal from './ConditionDetailsModal'

interface ConditionsTabProps {
  patientId: number
}

export default function ConditionsTab({ patientId }: ConditionsTabProps) {
  const { hasPermission } = usePermissions()
  const [conditions, setConditions] = useState<PatientCondition[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [editingCondition, setEditingCondition] = useState<PatientCondition | null>(null)
  const [viewingCondition, setViewingCondition] = useState<PatientCondition | null>(null)

  useEffect(() => {
    fetchConditions()
  }, [patientId])

  const fetchConditions = async () => {
    try {
      setLoading(true)
      const response = await patientConditionService.getAll(patientId)
      setConditions(response.data)
    } catch (error) {
      console.error('Error fetching conditions:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingCondition(null)
    setIsModalOpen(true)
  }

  const openEditModal = (condition: PatientCondition) => {
    setEditingCondition(condition)
    setIsModalOpen(true)
  }

  const openViewModal = (condition: PatientCondition) => {
    setViewingCondition(condition)
    setIsDetailsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCondition(null)
  }

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setViewingCondition(null)
  }

  const handleSuccess = () => {
    fetchConditions()
  }

  const handleDelete = async (conditionId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta condición?')) {
      return
    }

    try {
      const response = await patientConditionService.delete(conditionId)
      if (response.success) {
        await fetchConditions()
      } else {
        alert(response.error || 'Error al eliminar la condición')
      }
    } catch (error) {
      console.error('Error deleting condition:', error)
      alert('Error al eliminar la condición')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'recurrence':
      case 'relapse':
        return <ExclamationTriangleIcon className="h-5 w-5 text-purple-600" />
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'remission':
        return <ClockIcon className="h-5 w-5 text-blue-600" />
      default:
        return <HeartIcon className="h-5 w-5 text-gray-400" />
    }
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

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null

    const badges: Record<string, { bg: string; text: string; label: string }> = {
      mild: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Leve' },
      moderate: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Moderada' },
      severe: { bg: 'bg-red-100', text: 'text-red-800', label: 'Grave' },
    }

    const badge = badges[severity]
    if (!badge) return null

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-blue-600 dark:text-white">
          Condiciones Médicas
        </h3>
        <PermissionGuard permission="patient_conditions.create">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Agregar Condición
          </button>
        </PermissionGuard>
      </div>

      {/* Conditions List */}
      {conditions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <HeartIcon className="mx-auto h-12 w-12 text-purple-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay condiciones registradas</h3>
          <p className="mt-1 text-sm text-gray-600">
            Comienza agregando la primera condición médica del paciente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conditions.map((condition) => (
            <div
              key={condition.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getStatusIcon(condition.clinical_status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                        {condition.condition.name}
                      </p>
                      {getSeverityBadge(condition.severity)}
                      {condition.is_active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Activa
                        </span>
                      )}
                    </div>
                    {condition.condition.code && (
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        <span className="font-medium text-gray-700">Código:</span> {condition.condition.code}
                        {condition.condition.system && ` (${condition.condition.system})`}
                      </p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                      <span>
                        <span className="font-medium">Estado:</span> {getStatusLabel(condition.clinical_status)}
                      </span>
                      <span>
                        <span className="font-medium">Verificación:</span> {getVerificationLabel(condition.verification_status)}
                      </span>
                      {condition.dates.onset && (
                        <span>
                          <span className="font-medium">Inicio:</span>{' '}
                          {new Date(condition.dates.onset).toLocaleDateString('es-ES')}
                        </span>
                      )}
                      {condition.dates.duration_days !== null && condition.dates.duration_days !== undefined && (
                        <span>
                          <span className="font-medium">Duración:</span> {condition.dates.duration_days} días
                        </span>
                      )}
                    </div>
                    {condition.notes && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">{condition.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openViewModal(condition)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    title="Ver detalles"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <PermissionGuard permission="patient_conditions.update">
                    <button
                      onClick={() => openEditModal(condition)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      title="Editar condición"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permission="patient_conditions.delete">
                    <button
                      onClick={() => handleDelete(condition.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      title="Eliminar condición"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConditionFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
        patientId={patientId}
        editingCondition={editingCondition}
      />

      <ConditionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        condition={viewingCondition}
      />
    </div>
  )
}
