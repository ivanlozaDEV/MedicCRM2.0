'use client'

import { useState, useEffect } from 'react'
import { patientAllergyService, type PatientAllergy, allergyService, type Allergy } from '@/lib/services'
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
  allergy_id: number | null
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
  allergy_id: null,
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
  const [allergyCatalog, setAllergyCatalog] = useState<Allergy[]>([])
  const [filteredCatalog, setFilteredCatalog] = useState<Allergy[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCatalogAllergy, setSelectedCatalogAllergy] = useState<Allergy | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAllergy, setEditingAllergy] = useState<PatientAllergy | null>(null)
  const [formData, setFormData] = useState<AllergyFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [useCustomAllergen, setUseCustomAllergen] = useState(false)

  useEffect(() => {
    fetchAllergies()
  }, [patientId])

  useEffect(() => {
    if (isModalOpen) {
      fetchAllergyCatalog()
    }
  }, [isModalOpen])

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

  const fetchAllergyCatalog = async () => {
    try {
      const response = await allergyService.getAll({ only_active: true })
      if (response.success) {
        setAllergyCatalog(response.data)
        setFilteredCatalog(response.data)
      }
    } catch (error) {
      console.error('Error fetching allergy catalog:', error)
    }
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setShowSuggestions(true)
    
    if (!query.trim()) {
      setFilteredCatalog(allergyCatalog)
      return
    }

    // Simple fuzzy search - matches if query chars appear in order in the name
    const lowerQuery = query.toLowerCase()
    const filtered = allergyCatalog.filter(allergy => {
      const lowerName = allergy.name.toLowerCase()
      const lowerCategory = (allergy.category || '').toLowerCase()
      const lowerDesc = (allergy.description || '').toLowerCase()
      
      // Exact match or contains
      if (lowerName.includes(lowerQuery) || 
          lowerCategory.includes(lowerQuery) ||
          lowerDesc.includes(lowerQuery)) {
        return true
      }
      
      // Fuzzy match - characters in order
      let queryIndex = 0
      for (let i = 0; i < lowerName.length && queryIndex < lowerQuery.length; i++) {
        if (lowerName[i] === lowerQuery[queryIndex]) {
          queryIndex++
        }
      }
      return queryIndex === lowerQuery.length
    })
    
    setFilteredCatalog(filtered)
  }

  const handleAllergySelect = (allergy: Allergy) => {
    setUseCustomAllergen(false)
    setSelectedCatalogAllergy(allergy)
    setSearchQuery(allergy.name)
    setShowSuggestions(false)
    setFormData({
      ...formData,
      allergy_id: allergy.id,
      allergen: allergy.name,
      allergen_code: allergy.codes.snomed || allergy.codes.rxnorm || '',
      allergen_system: allergy.codes.snomed ? 'SNOMED CT' : allergy.codes.rxnorm ? 'RxNorm' : '',
      reaction_description: '', // Dejar vacío para que el doctor lo llene
      severity: allergy.typical_severity || '' // Sugerencia, pero editable
    })
  }

  const handleCustomAllergen = () => {
    setUseCustomAllergen(true)
    setSelectedCatalogAllergy(null)
    setShowSuggestions(false)
    setFormData({
      ...formData,
      allergy_id: null,
      allergen: searchQuery,
      allergen_code: '',
      allergen_system: '',
      reaction_description: '',
      severity: ''
    })
  }

  const openCreateModal = () => {
    setEditingAllergy(null)
    setFormData(initialFormData)
    setFormErrors({})
    setUseCustomAllergen(false)
    setSelectedCatalogAllergy(null)
    setSearchQuery('')
    setShowSuggestions(false)
    setFilteredCatalog(allergyCatalog)
    setIsModalOpen(true)
  }

  const openEditModal = (allergy: PatientAllergy) => {
    setEditingAllergy(allergy)
    setFormData({
      allergy_id: null, // Will be set if from catalog
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
    setUseCustomAllergen(true) // Assume custom when editing
    setSelectedCatalogAllergy(null)
    setSearchQuery('')
    setShowSuggestions(false)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAllergy(null)
    setFormData(initialFormData)
    setFormErrors({})
    setUseCustomAllergen(false)
    setSelectedCatalogAllergy(null)
    setSearchQuery('')
    setShowSuggestions(false)
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
        allergy_id: formData.allergy_id || undefined,
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingAllergy ? 'Editar Alergia' : 'Nueva Alergia'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Allergy Search from Catalog */}
              {!editingAllergy && !useCustomAllergen && (
                <div className="relative">
                  <label htmlFor="allergy_search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Buscar Alérgeno en el Catálogo
                  </label>
                  <input
                    type="text"
                    id="allergy_search"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Escribe para buscar: penicilina, maní, polen..."
                    autoComplete="off"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && searchQuery && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCatalog.length > 0 ? (
                        <>
                          {filteredCatalog.map((allergy) => (
                            <button
                              key={allergy.id}
                              type="button"
                              onClick={() => handleAllergySelect(allergy)}
                              className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {allergy.name}
                                  </p>
                                  {allergy.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      {allergy.description}
                                    </p>
                                  )}
                                </div>
                                {allergy.category && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    {allergy.category}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={handleCustomAllergen}
                            className="w-full text-left px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-medium"
                          >
                            ➕ Usar "{searchQuery}" como alérgeno personalizado
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCustomAllergen}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <p className="font-medium">No se encontraron resultados</p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                            ➕ Click para usar "{searchQuery}" como alérgeno personalizado
                          </p>
                        </button>
                      )}
                    </div>
                  )}
                  
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Busca en el catálogo para autocompletar códigos y reacciones comunes
                  </p>
                </div>
              )}

              {/* Show allergen input only if custom or editing */}
              {(useCustomAllergen || editingAllergy) && (
                <>
                  {/* Allergen */}
                  <div>
                    <label htmlFor="allergen" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alérgeno * {!editingAllergy && <span className="text-xs text-gray-500">(Personalizado)</span>}
                    </label>
                    <input
                      type="text"
                      id="allergen"
                      value={formData.allergen}
                      onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                      className={`block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm dark:bg-gray-700 dark:text-white ${
                        formErrors.allergen
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600'
                      }`}
                      placeholder="Ej: Penicilina, Polen, Maní"
                    />
                    {formErrors.allergen && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.allergen}</p>
                    )}
                  </div>

                  {/* Allergen Code (optional) */}
                  <div>
                    <label htmlFor="allergen_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código (SNOMED CT / RxNorm)
                    </label>
                    <input
                      type="text"
                      id="allergen_code"
                      value={formData.allergen_code}
                      onChange={(e) => setFormData({ ...formData, allergen_code: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Código opcional"
                    />
                  </div>
                </>
              )}

              {/* Show allergen info if selected from catalog */}
              {!useCustomAllergen && !editingAllergy && selectedCatalogAllergy && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                      {selectedCatalogAllergy.name}
                    </h4>
                    {selectedCatalogAllergy.description && (
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-2">
                        {selectedCatalogAllergy.description}
                      </p>
                    )}
                  </div>
                  
                  {selectedCatalogAllergy.codes.snomed || selectedCatalogAllergy.codes.rxnorm ? (
                    <div className="text-xs text-indigo-700 dark:text-indigo-300">
                      <span className="font-medium">Código:</span>{' '}
                      {selectedCatalogAllergy.codes.snomed || selectedCatalogAllergy.codes.rxnorm}{' '}
                      ({selectedCatalogAllergy.codes.snomed ? 'SNOMED CT' : 'RxNorm'})
                    </div>
                  ) : null}
                  
                  {selectedCatalogAllergy.common_reactions && selectedCatalogAllergy.common_reactions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-indigo-900 dark:text-indigo-100 mb-1">
                        Reacciones comunes documentadas:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCatalogAllergy.common_reactions.map((reaction, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100"
                          >
                            {reaction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedCatalogAllergy.typical_severity && (
                    <div className="text-xs text-indigo-700 dark:text-indigo-300">
                      <span className="font-medium">Severidad típica:</span>{' '}
                      {selectedCatalogAllergy.typical_severity === 'mild' ? 'Leve' : 
                       selectedCatalogAllergy.typical_severity === 'moderate' ? 'Moderada' : 'Severa'}
                    </div>
                  )}
                </div>
              )}

              {/* Reaction Description - What the patient experienced */}
              <div>
                <label htmlFor="reaction_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reacción Observada en el Paciente
                </label>
                <input
                  type="text"
                  id="reaction_description"
                  value={formData.reaction_description}
                  onChange={(e) => setFormData({ ...formData, reaction_description: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Describe la reacción que presentó el paciente..."
                />
              </div>

              {/* Severity and Criticality in one row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Severity */}
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Severidad <span className="text-xs text-gray-500">(gravedad observada)</span>
                  </label>
                  <select
                    id="severity"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="mild">Leve (síntomas menores)</option>
                    <option value="moderate">Moderada (requiere tratamiento)</option>
                    <option value="severe">Severa (amenaza la vida)</option>
                  </select>
                </div>

                {/* Criticality */}
                <div>
                  <label htmlFor="criticality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Criticidad <span className="text-xs text-gray-500">(riesgo futuro)</span>
                  </label>
                  <select
                    id="criticality"
                    value={formData.criticality}
                    onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="low">Baja (no amenaza la vida)</option>
                    <option value="high">Alta (podría ser mortal)</option>
                    <option value="unable-to-assess">No evaluable</option>
                  </select>
                </div>
              </div>

              {/* Manifestation */}
              <div>
                <label htmlFor="manifestation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Manifestación
                </label>
                <input
                  type="text"
                  id="manifestation"
                  value={formData.manifestation}
                  onChange={(e) => setFormData({ ...formData, manifestation: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej: Urticaria, edema facial, broncoespasmo"
                />
              </div>

              {/* Onset Date */}
              <div>
                <label htmlFor="onset_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Inicio <span className="text-xs text-gray-500">(o describir edad en notas)</span>
                </label>
                <input
                  type="date"
                  id="onset_date"
                  value={formData.onset_date}
                  onChange={(e) => setFormData({ ...formData, onset_date: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Clinical Status and Verification Status in one row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Clinical Status */}
                <div>
                  <label htmlFor="clinical_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado Clínico *
                  </label>
                  <select
                    id="clinical_status"
                    value={formData.clinical_status}
                    onChange={(e) => setFormData({ ...formData, clinical_status: e.target.value })}
                    className={`block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm dark:bg-gray-700 dark:text-white ${
                      formErrors.clinical_status
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600'
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
                  <label htmlFor="verification_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado de Verificación *
                  </label>
                  <select
                    id="verification_status"
                    value={formData.verification_status}
                    onChange={(e) => setFormData({ ...formData, verification_status: e.target.value })}
                    className={`block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm dark:bg-gray-700 dark:text-white ${
                      formErrors.verification_status
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600'
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
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej: Desde la infancia, A los 5 años, Tratamiento dado, evolución..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Guardando...' : editingAllergy ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
