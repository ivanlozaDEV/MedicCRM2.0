'use client'

import { useState, useEffect } from 'react'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { patientConditionService, conditionService, type PatientCondition, type CreatePatientConditionData, type Condition } from '@/lib/services'

interface ConditionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  patientId: number
  editingCondition?: PatientCondition | null
}

interface ConditionFormData {
  condition_id: number | null
  condition_name: string
  condition_code: string
  condition_system: string
  clinical_status: string
  verification_status: string
  category: string
  severity: string
  onset_date: string
  abatement_date: string
  body_site: string
  stage: string
  recorder_name: string
  notes: string
}

const initialFormData: ConditionFormData = {
  condition_id: null,
  condition_name: '',
  condition_code: '',
  condition_system: '',
  clinical_status: 'active',
  verification_status: 'confirmed',
  category: '',
  severity: '',
  onset_date: '',
  abatement_date: '',
  body_site: '',
  stage: '',
  recorder_name: '',
  notes: ''
}

export default function ConditionFormModal({
  isOpen,
  onClose,
  onSuccess,
  patientId,
  editingCondition,
}: ConditionFormModalProps) {
  const [conditionCatalog, setConditionCatalog] = useState<Condition[]>([])
  const [filteredCatalog, setFilteredCatalog] = useState<Condition[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCatalogCondition, setSelectedCatalogCondition] = useState<Condition | null>(null)
  const [formData, setFormData] = useState<ConditionFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [useCustomCondition, setUseCustomCondition] = useState(false)

  // Load catalog when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchConditionCatalog()
    }
  }, [isOpen])

  // Initialize form data when editing or creating
  useEffect(() => {
    if (isOpen) {
      if (editingCondition) {
        // Editing mode
        setFormData({
          condition_id: null,
          condition_name: editingCondition.condition.name,
          condition_code: editingCondition.condition.code || '',
          condition_system: editingCondition.condition.system || '',
          clinical_status: editingCondition.clinical_status,
          verification_status: editingCondition.verification_status,
          category: editingCondition.category || '',
          severity: editingCondition.severity || '',
          onset_date: editingCondition.dates.onset || '',
          abatement_date: editingCondition.dates.abatement || '',
          body_site: editingCondition.clinical_info.body_site || '',
          stage: editingCondition.clinical_info.stage || '',
          recorder_name: editingCondition.recorder_name || '',
          notes: editingCondition.notes || ''
        })
        setUseCustomCondition(true)
        setSelectedCatalogCondition(null)
        setSearchQuery('')
      } else {
        // Create mode
        setFormData(initialFormData)
        setUseCustomCondition(false)
        setSelectedCatalogCondition(null)
        setSearchQuery('')
      }
      setFormErrors({})
      setShowSuggestions(false)
    }
  }, [isOpen, editingCondition])

  const fetchConditionCatalog = async () => {
    try {
      const response = await conditionService.getAll({ only_active: true })
      if (response.success) {
        setConditionCatalog(response.data)
        setFilteredCatalog(response.data)
      }
    } catch (error) {
      console.error('Error fetching condition catalog:', error)
    }
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setShowSuggestions(true)
    
    if (!query.trim()) {
      setFilteredCatalog(conditionCatalog)
      return
    }

    // Simple fuzzy search - matches if query chars appear in order in the name
    const lowerQuery = query.toLowerCase()
    const filtered = conditionCatalog.filter(condition => {
      const lowerName = condition.name.toLowerCase()
      const lowerCategory = (condition.category || '').toLowerCase()
      const lowerDesc = (condition.description || '').toLowerCase()
      const lowerIcd10 = (condition.icd10_code || '').toLowerCase()
      
      // Exact match or contains
      if (lowerName.includes(lowerQuery) || 
          lowerCategory.includes(lowerQuery) ||
          lowerDesc.includes(lowerQuery) ||
          lowerIcd10.includes(lowerQuery)) {
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

  const handleConditionSelect = (condition: Condition) => {
    setUseCustomCondition(false)
    setSelectedCatalogCondition(condition)
    setSearchQuery(condition.name)
    setShowSuggestions(false)
    setFormData({
      ...formData,
      condition_id: condition.id,
      condition_name: condition.name,
      condition_code: condition.icd10_code || condition.snomed_code || '',
      condition_system: condition.icd10_code ? 'ICD-10' : condition.snomed_code ? 'SNOMED CT' : '',
      category: condition.category || '',
      severity: condition.typical_severity || '' // Sugerencia, pero editable
    })
  }

  const handleCustomCondition = () => {
    setUseCustomCondition(true)
    setSelectedCatalogCondition(null)
    setShowSuggestions(false)
    setFormData({
      ...formData,
      condition_id: null,
      condition_name: searchQuery,
      condition_code: '',
      condition_system: '',
      category: '',
      severity: ''
    })
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Solo los básicos son requeridos
    if (!formData.condition_name.trim()) {
      errors.condition_name = 'El nombre de la condición es requerido'
    }
    if (!formData.clinical_status) {
      errors.clinical_status = 'El estado clínico es requerido'
    }
    if (!formData.verification_status) {
      errors.verification_status = 'El estado de verificación es requerido'
    }

    // El resto de campos son opcionales, no requieren validación

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (field: keyof ConditionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSubmitting(true)

      const conditionData = {
        patient_id: patientId,
        condition_id: formData.condition_id || undefined,
        condition_name: formData.condition_name,
        condition_code: formData.condition_code || undefined,
        condition_system: formData.condition_system || undefined,
        clinical_status: formData.clinical_status,
        verification_status: formData.verification_status,
        category: formData.category || undefined,
        severity: formData.severity || undefined,
        onset_date: formData.onset_date || undefined,
        abatement_date: formData.abatement_date || undefined,
        body_site: formData.body_site || undefined,
        stage: formData.stage || undefined,
        recorder_name: formData.recorder_name || undefined,
        notes: formData.notes || undefined
      }

      let response
      if (editingCondition) {
        response = await patientConditionService.update(editingCondition.id, conditionData)
      } else {
        response = await patientConditionService.create(conditionData)
      }

      if (response.success) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error saving condition:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {editingCondition ? 'Editar Condición' : 'Nueva Condición'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Condition Search from Catalog */}
          {!editingCondition && !useCustomCondition && (
            <div className="relative">
              <label htmlFor="condition_search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar Condición en el Catálogo
              </label>
              <input
                type="text"
                id="condition_search"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Escribe para buscar: diabetes, hipertensión, asma..."
                autoComplete="off"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && searchQuery && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCatalog.length > 0 ? (
                    <>
                      {filteredCatalog.map((condition) => (
                        <button
                          key={condition.id}
                          type="button"
                          onClick={() => handleConditionSelect(condition)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {condition.name}
                              </p>
                              {condition.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {condition.description}
                                </p>
                              )}
                              {condition.icd10_code && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                  ICD-10: {condition.icd10_code}
                                </p>
                              )}
                            </div>
                            <div className="ml-2 flex flex-col items-end gap-1">
                              {condition.category && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  {condition.category}
                                </span>
                              )}
                              {condition.is_chronic && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                  Crónica
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleCustomCondition}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
                      >
                        ➕ Usar "{searchQuery}" como condición personalizada
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCustomCondition}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <p className="font-medium">No se encontraron resultados</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        ➕ Click para usar "{searchQuery}" como condición personalizada
                      </p>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Condition Name (shown when custom or editing) */}
          {(useCustomCondition || editingCondition) && (
            <div>
              <label htmlFor="condition_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de la Condición <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="condition_name"
                value={formData.condition_name}
                onChange={(e) => handleChange('condition_name', e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ej: Diabetes Mellitus Tipo 2"
              />
              {formErrors.condition_name && (
                <p className="mt-1 text-xs text-red-600">{formErrors.condition_name}</p>
              )}
            </div>
          )}

          {/* Selected Condition from Catalog - Info Display */}
          {!editingCondition && selectedCatalogCondition && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Condición Seleccionada del Catálogo
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                    {selectedCatalogCondition.name}
                  </p>
                  {selectedCatalogCondition.description && (
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      {selectedCatalogCondition.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedCatalogCondition.icd10_code && (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                        ICD-10: {selectedCatalogCondition.icd10_code}
                      </span>
                    )}
                    {selectedCatalogCondition.snomed_code && (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                        SNOMED: {selectedCatalogCondition.snomed_code}
                      </span>
                    )}
                    {selectedCatalogCondition.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {selectedCatalogCondition.category}
                      </span>
                    )}
                    {selectedCatalogCondition.is_chronic && (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400">
                        Crónica
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCatalogCondition(null)
                    setSearchQuery('')
                    setFormData(initialFormData)
                  }}
                  className="ml-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                >
                  Cambiar
                </button>
              </div>
            </div>
          )}

          {/* Code Fields (Manual edit when custom) */}
          {(useCustomCondition || editingCondition) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="condition_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código (ICD-10, SNOMED CT)
                </label>
                <input
                  type="text"
                  id="condition_code"
                  value={formData.condition_code}
                  onChange={(e) => handleChange('condition_code', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej: E11.9"
                />
              </div>

              <div>
                <label htmlFor="condition_system" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sistema de Codificación
                </label>
                <select
                  id="condition_system"
                  value={formData.condition_system}
                  onChange={(e) => handleChange('condition_system', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Seleccionar...</option>
                  <option value="ICD-10">ICD-10</option>
                  <option value="SNOMED CT">SNOMED CT</option>
                  <option value="ICD-11">ICD-11</option>
                </select>
              </div>
            </div>
          )}

          {/* Estado Clínico */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Estado Clínico
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="clinical_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado Clínico
                </label>
                <select
                  id="clinical_status"
                  value={formData.clinical_status}
                  onChange={(e) => handleChange('clinical_status', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="active">Activa</option>
                  <option value="recurrence">Recurrencia</option>
                  <option value="relapse">Recaída</option>
                  <option value="inactive">Inactiva</option>
                  <option value="remission">Remisión</option>
                  <option value="resolved">Resuelta</option>
                </select>
              </div>

              <div>
                <label htmlFor="verification_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Verificación
                </label>
                <select
                  id="verification_status"
                  value={formData.verification_status}
                  onChange={(e) => handleChange('verification_status', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="unconfirmed">No confirmada</option>
                  <option value="provisional">Provisional</option>
                  <option value="differential">Diferencial</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="refuted">Refutada</option>
                  <option value="entered-in-error">Error de entrada</option>
                </select>
              </div>

              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severidad
                </label>
                <select
                  id="severity"
                  value={formData.severity}
                  onChange={(e) => handleChange('severity', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sin especificar</option>
                  <option value="mild">Leve</option>
                  <option value="moderate">Moderada</option>
                  <option value="severe">Grave</option>
                </select>
              </div>
            </div>

            {(useCustomCondition || editingCondition) && (
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Seleccionar...</option>
                  <option value="problem-list-item">Lista de Problemas</option>
                  <option value="encounter-diagnosis">Diagnóstico de Encuentro</option>
                </select>
              </div>
            )}
          </div>

          {/* Cronología */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Cronología
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="onset_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  id="onset_date"
                  value={formData.onset_date}
                  onChange={(e) => handleChange('onset_date', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="abatement_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Resolución
                </label>
                <input
                  type="date"
                  id="abatement_date"
                  value={formData.abatement_date}
                  onChange={(e) => handleChange('abatement_date', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Detalles Clínicos */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Detalles Clínicos
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="body_site" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sitio Anatómico
                </label>
                <input
                  type="text"
                  id="body_site"
                  value={formData.body_site}
                  onChange={(e) => handleChange('body_site', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej: Pulmón derecho"
                />
              </div>

              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Etapa/Grado
                </label>
                <input
                  type="text"
                  id="stage"
                  value={formData.stage}
                  onChange={(e) => handleChange('stage', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej: Etapa 2"
                />
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Información Adicional
            </h4>

            <div>
              <label htmlFor="recorder_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Registrado por
              </label>
              <input
                type="text"
                id="recorder_name"
                value={formData.recorder_name}
                onChange={(e) => handleChange('recorder_name', e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Nombre del médico o profesional"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas Clínicas
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Información adicional relevante..."
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Guardando...' : editingCondition ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
