'use client'

import { useState, useEffect } from 'react'
import { patientAllergyService, type PatientAllergy } from '@/lib/services'
import { usePermissions, PermissionGuard } from '@/lib/hooks/usePermissions'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface AllergiesTabProps {
  patientId: number
}

interface AllergyFormData {
  allergen: string
  allergen_code: string
  allergen_system: string
  reaction_description: string
  severity: string
  manifestation: string
  criticality: string
  onset_date: string
  notes: string
  clinical_status: string
  verification_status: string
}

const initialFormData: AllergyFormData = {
  allergen: '',
  allergen_code: '',
  allergen_system: '',
  reaction_description: '',
  severity: '',
  manifestation: '',
  criticality: '',
  onset_date: '',
  notes: '',
  clinical_status: 'active',
  verification_status: 'unconfirmed'
}

export default function AllergiesTab({ patientId }: AllergiesTabProps) {
  const { hasPermission } = usePermissions()
  const [allergies, setAllergies] = useState<PatientAllergy[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAllergy, setEditingAllergy] = useState<PatientAllergy | null>(null)
  const [formData, setFormData] = useState<AllergyFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

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
    setFormData(initialFormData)
    setFormErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (allergy: PatientAllergy) => {
    setEditingAllergy(allergy)
    setFormData({
      allergen: allergy.allergen.name,
      allergen_code: allergy.allergen.code || '',
      allergen_system: allergy.allergen.system || '',
      reaction_description: allergy.reaction.description || '',
      severity: allergy.reaction.severity || '',
      manifestation: allergy.reaction.manifestation || '',
      criticality: allergy.criticality || '',
      onset_date: allergy.dates.onset || '',
      notes: allergy.notes || '',
      clinical_status: allergy.clinical_status,
      verification_status: allergy.verification_status
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAllergy(null)
    setFormData(initialFormData)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.allergen.trim()) {
      errors.allergen = 'El alérgeno es requerido'
    }

    if (!formData.clinical_status) {
      errors.clinical_status = 'El estado clínico es requerido'
    }

    if (!formData.verification_status) {
      errors.verification_status = 'El estado de verificación es requerido'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSubmitting(true)

      const allergyData = {
        patient_id: patientId,
        allergen: formData.allergen,
        allergen_code: formData.allergen_code || undefined,
        allergen_system: formData.allergen_system || undefined,
        reaction_description: formData.reaction_description || undefined,
        severity: formData.severity || undefined,
        manifestation: formData.manifestation || undefined,
        criticality: formData.criticality || undefined,
        onset_date: formData.onset_date || undefined,
        notes: formData.notes || undefined,
        clinical_status: formData.clinical_status,
        verification_status: formData.verification_status
      }

      let response
      if (editingAllergy) {
        response = await patientAllergyService.update(editingAllergy.id, allergyData)
      } else {
        response = await patientAllergyService.create(allergyData)
      }

      if (response.success) {
        await fetchAllergies()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving allergy:', error)
    } finally {
      setSubmitting(false)
    }
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={closeModal}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Cerrar</span>
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                    {editingAllergy ? 'Editar Alergia' : 'Nueva Alergia'}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Allergen */}
                    <div>
                      <label htmlFor="allergen" className="block text-sm font-medium text-gray-700">
                        Alérgeno *
                      </label>
                      <input
                        type="text"
                        id="allergen"
                        value={formData.allergen}
                        onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                          formErrors.allergen
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Ej: Penicilina, Polen, Maní"
                      />
                      {formErrors.allergen && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.allergen}</p>
                      )}
                    </div>

                    {/* Allergen Code (optional) */}
                    <div>
                      <label htmlFor="allergen_code" className="block text-sm font-medium text-gray-700">
                        Código (SNOMED CT / RxNorm)
                      </label>
                      <input
                        type="text"
                        id="allergen_code"
                        value={formData.allergen_code}
                        onChange={(e) => setFormData({ ...formData, allergen_code: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Código opcional"
                      />
                    </div>

                    {/* Reaction Description */}
                    <div>
                      <label htmlFor="reaction_description" className="block text-sm font-medium text-gray-700">
                        Descripción de la Reacción
                      </label>
                      <input
                        type="text"
                        id="reaction_description"
                        value={formData.reaction_description}
                        onChange={(e) => setFormData({ ...formData, reaction_description: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Ej: Urticaria, Anafilaxia, Erupción cutánea"
                      />
                    </div>

                    {/* Severity */}
                    <div>
                      <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                        Severidad
                      </label>
                      <select
                        id="severity"
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="mild">Leve</option>
                        <option value="moderate">Moderada</option>
                        <option value="severe">Severa</option>
                      </select>
                    </div>

                    {/* Manifestation */}
                    <div>
                      <label htmlFor="manifestation" className="block text-sm font-medium text-gray-700">
                        Manifestación
                      </label>
                      <input
                        type="text"
                        id="manifestation"
                        value={formData.manifestation}
                        onChange={(e) => setFormData({ ...formData, manifestation: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Cómo se manifiesta la reacción"
                      />
                    </div>

                    {/* Criticality */}
                    <div>
                      <label htmlFor="criticality" className="block text-sm font-medium text-gray-700">
                        Criticidad
                      </label>
                      <select
                        id="criticality"
                        value={formData.criticality}
                        onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="low">Baja</option>
                        <option value="high">Alta</option>
                        <option value="unable-to-assess">No evaluable</option>
                      </select>
                    </div>

                    {/* Onset Date */}
                    <div>
                      <label htmlFor="onset_date" className="block text-sm font-medium text-gray-700">
                        Fecha de Inicio
                      </label>
                      <input
                        type="date"
                        id="onset_date"
                        value={formData.onset_date}
                        onChange={(e) => setFormData({ ...formData, onset_date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    {/* Clinical Status */}
                    <div>
                      <label htmlFor="clinical_status" className="block text-sm font-medium text-gray-700">
                        Estado Clínico *
                      </label>
                      <select
                        id="clinical_status"
                        value={formData.clinical_status}
                        onChange={(e) => setFormData({ ...formData, clinical_status: e.target.value })}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                          formErrors.clinical_status
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      >
                        <option value="active">Activa</option>
                        <option value="inactive">Inactiva</option>
                        <option value="resolved">Resuelta</option>
                      </select>
                      {formErrors.clinical_status && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.clinical_status}</p>
                      )}
                    </div>

                    {/* Verification Status */}
                    <div>
                      <label htmlFor="verification_status" className="block text-sm font-medium text-gray-700">
                        Estado de Verificación *
                      </label>
                      <select
                        id="verification_status"
                        value={formData.verification_status}
                        onChange={(e) => setFormData({ ...formData, verification_status: e.target.value })}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                          formErrors.verification_status
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      >
                        <option value="unconfirmed">No confirmada</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="refuted">Refutada</option>
                        <option value="entered-in-error">Error de entrada</option>
                      </select>
                      {formErrors.verification_status && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.verification_status}</p>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Notas
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Información adicional sobre la alergia..."
                      />
                    </div>

                    {/* Actions */}
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Guardando...' : editingAllergy ? 'Actualizar' : 'Crear'}
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
