'use client'

import { useState, useEffect } from 'react'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { medicationService, patientMedicationService, type MedicationCatalog, type PatientMedication } from '@/lib/services'

interface MedicationFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  patientId: number
  editingMedication: PatientMedication | null
}

interface MedicationFormData {
  medication_id: number | null
  medication_name: string
  medication_code: string
  medication_system: string
  status: string
  dosage_text: string
  dose: string
  route: string
  frequency: string
  start_date: string
  end_date: string
  reason_code: string
  reason_text: string
  prescriber_name: string
  pharmacy: string
  refills_remaining: number | null
  is_prn: boolean
  notes: string
}

const initialFormData: MedicationFormData = {
  medication_id: null,
  medication_name: '',
  medication_code: '',
  medication_system: '',
  status: 'active',
  dosage_text: '',
  dose: '',
  route: '',
  frequency: '',
  start_date: '',
  end_date: '',
  reason_code: '',
  reason_text: '',
  prescriber_name: '',
  pharmacy: '',
  refills_remaining: null,
  is_prn: false,
  notes: ''
}

export default function MedicationFormModal({
  isOpen,
  onClose,
  onSuccess,
  patientId,
  editingMedication
}: MedicationFormModalProps) {
  const [medicationCatalog, setMedicationCatalog] = useState<MedicationCatalog[]>([])
  const [filteredCatalog, setFilteredCatalog] = useState<MedicationCatalog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCatalogMedication, setSelectedCatalogMedication] = useState<MedicationCatalog | null>(null)
  const [formData, setFormData] = useState<MedicationFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [useCustomMedication, setUseCustomMedication] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchMedicationCatalog()
      
      if (editingMedication) {
        // Convertir de estructura FHIR a estructura plana para el formulario
        setFormData({
          medication_id: null, // No viene en la estructura FHIR
          medication_name: editingMedication.medication.name,
          medication_code: editingMedication.medication.code || '',
          medication_system: editingMedication.medication.system || '',
          status: editingMedication.status,
          dosage_text: editingMedication.dosage.text || '',
          dose: editingMedication.dosage.dose || '',
          route: editingMedication.dosage.route || '',
          frequency: editingMedication.dosage.frequency || '',
          start_date: editingMedication.timing.start_date || '',
          end_date: editingMedication.timing.end_date || '',
          reason_code: editingMedication.reason.code || '',
          reason_text: editingMedication.reason.text || '',
          prescriber_name: editingMedication.prescriber_name || '',
          pharmacy: editingMedication.pharmacy || '',
          refills_remaining: editingMedication.refills_remaining || null,
          is_prn: editingMedication.dosage.is_prn || false,
          notes: editingMedication.notes || ''
        })
        
        // Intentar encontrar el medicamento en el catálogo por código
        if (editingMedication.medication.code) {
          const catalogMed = medicationCatalog.find(m => m.codes?.rxnorm === editingMedication.medication.code)
          if (catalogMed) {
            setSelectedCatalogMedication(catalogMed)
            setSearchQuery(catalogMed.name)
          } else {
            setSearchQuery(editingMedication.medication.name)
            setUseCustomMedication(true)
          }
        } else {
          setSearchQuery(editingMedication.medication.name)
          setUseCustomMedication(true)
        }
      } else {
        setFormData(initialFormData)
        setSearchQuery('')
        setSelectedCatalogMedication(null)
        setUseCustomMedication(false)
      }
      setFormErrors({})
    }
  }, [isOpen, editingMedication])

  const fetchMedicationCatalog = async () => {
    try {
      const medications = await medicationService.getAll({ is_active: true })
      setMedicationCatalog(medications)
      setFilteredCatalog(medications)
    } catch (error) {
      console.error('Error fetching medication catalog:', error)
    }
  }

  const fuzzyMatch = (str: string, pattern: string): boolean => {
    const patternLower = pattern.toLowerCase()
    const strLower = str.toLowerCase()
    
    if (strLower.includes(patternLower)) return true
    
    let patternIdx = 0
    for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
      if (strLower[i] === patternLower[patternIdx]) {
        patternIdx++
      }
    }
    return patternIdx === patternLower.length
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value || '')
    setShowSuggestions(true)
    
    if (!value || !value.trim()) {
      setFilteredCatalog(medicationCatalog)
      return
    }

    const filtered = medicationCatalog.filter(med => {
      const searchableText = [
        med.name,
        med.generic_name || '',
        ...(med.brand_names || []),
        med.description || '',
        med.category || '',
        med.drug_class || ''
      ].join(' ')
      
      return fuzzyMatch(searchableText, value)
    })
    
    setFilteredCatalog(filtered)
  }

  const handleMedicationSelect = (medication: MedicationCatalog) => {
    setSelectedCatalogMedication(medication)
    setSearchQuery(medication.name)
    setShowSuggestions(false)
    setUseCustomMedication(false)
    
    setFormData(prev => ({
      ...prev,
      medication_id: medication.id,
      medication_name: medication.name,
      medication_code: medication.codes.rxnorm || medication.codes.ndc || '',
      medication_system: medication.codes.rxnorm ? 'RxNorm' : medication.codes.ndc ? 'NDC' : '',
      dose: medication.typical_info.doses?.[0] || '',
      route: medication.typical_info.routes?.[0] || '',
      frequency: medication.typical_info.frequencies?.[0] || ''
    }))
  }

  const handleCustomMedication = () => {
    setUseCustomMedication(true)
    setSelectedCatalogMedication(null)
    setShowSuggestions(false)
    
    setFormData(prev => ({
      ...prev,
      medication_id: null,
      medication_name: searchQuery,
      medication_code: '',
      medication_system: ''
    }))
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.medication_name.trim()) {
      errors.medication_name = 'El nombre del medicamento es requerido'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const submitData = {
        ...formData,
        refills_remaining: formData.refills_remaining || undefined
      }

      if (editingMedication) {
        await patientMedicationService.update(patientId, editingMedication.id, submitData)
      } else {
        await patientMedicationService.create(patientId, submitData)
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error saving medication:', error)
      setFormErrors({ 
        submit: error.response?.data?.error || 'Error al guardar medicamento' 
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-semibold text-gray-900">
            {editingMedication ? 'Editar Medicamento' : 'Agregar Nuevo Medicamento'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Medication Search / Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar en Catálogo de Medicamentos
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                
              placeholder="Escribe el nombre del medicamento (ej: Amoxicilina, Lisinopril)"
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && filteredCatalog.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCatalog.slice(0, 10).map((med) => (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => handleMedicationSelect(med)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{med.name}</div>
                          {med.generic_name && med.generic_name !== med.name && (
                            <div className="text-sm text-gray-600">Genérico: {med.generic_name}</div>
                          )}
                          {med.description && (
                            <div className="text-xs text-gray-500 mt-1">{med.description}</div>
                          )}
                        </div>
                        {getCategoryBadge(med.category)}
                      </div>
                    </button>
                  ))}
                  
                  {/* Custom medication option */}
                  {searchQuery && searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={handleCustomMedication}
                      className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 border-t-2 border-gray-300"
                    >
                      <div className="text-sm font-medium text-blue-600">
                        ➕ Agregar medicamento personalizado: &quot;{searchQuery}&quot;
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        No encontrado en el catálogo - agregar manualmente
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Tarjeta de Información del Catálogo */}
            {selectedCatalogMedication && !useCustomMedication && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900">{selectedCatalogMedication.name}</h4>
                    {selectedCatalogMedication.generic_name && (
                      <p className="text-sm text-blue-700 mt-1">
                        Genérico: {selectedCatalogMedication.generic_name}
                      </p>
                    )}
                    {selectedCatalogMedication.brand_names && selectedCatalogMedication.brand_names.length > 0 && (
                      <p className="text-sm text-blue-700">
                        Marcas comerciales: {selectedCatalogMedication.brand_names.join(', ')}
                      </p>
                    )}
                    {selectedCatalogMedication.description && (
                      <p className="text-sm text-blue-600 mt-2">{selectedCatalogMedication.description}</p>
                    )}
                    {selectedCatalogMedication.common_indications && selectedCatalogMedication.common_indications.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-blue-900">Usos comunes:</span>
                        <p className="text-xs text-blue-700">
                          {selectedCatalogMedication.common_indications.join(', ')}
                        </p>
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {selectedCatalogMedication.codes.rxnorm && (
                        <span className="px-2 py-1 bg-white text-blue-800 rounded border border-blue-300">
                          RxNorm: {selectedCatalogMedication.codes.rxnorm}
                        </span>
                      )}
                      {selectedCatalogMedication.codes.ndc && (
                        <span className="px-2 py-1 bg-white text-blue-800 rounded border border-blue-300">
                          NDC: {selectedCatalogMedication.codes.ndc}
                        </span>
                      )}
                      {selectedCatalogMedication.drug_class && (
                        <span className="px-2 py-1 bg-white text-blue-800 rounded border border-blue-300">
                          {selectedCatalogMedication.drug_class}
                        </span>
                      )}
                      {selectedCatalogMedication.safety.controlled_substance && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded border border-red-300 font-semibold">
                          Schedule {selectedCatalogMedication.safety.controlled_substance}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {useCustomMedication && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ℹ️ Agregando medicamento personalizado que no está en el catálogo. Por favor complete todos los detalles manualmente.
                </p>
              </div>
            )}
          </div>

          {/* Medication Name (required) */}
          <div>
            <label htmlFor="medication_name" className="block text-sm font-medium text-gray-700 mb-1">
              Medication Name *
            </label>
            <input
              type="text"
              id="medication_name"
              value={formData.medication_name}
              onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.medication_name ? 'border-red-500' : 'border-gray-300'
              } `}
              placeholder="e.g., Lisinopril, Metformin"
              readOnly={!!selectedCatalogMedication && !useCustomMedication}
            />
            {formErrors.medication_name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.medication_name}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Estado * <span className="text-xs text-gray-500">(estado actual del medicamento)</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
              
            >
              <option value="active">Activo - Tomando actualmente</option>
              <option value="completed">Completado - Curso terminado</option>
              <option value="stopped">Detenido - Descontinuado</option>
              <option value="on-hold">En Pausa - Temporalmente pausado</option>
            </select>
          </div>

          {/* Información de Dosificación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dose" className="block text-sm font-medium text-gray-700 mb-1">
                Dosis
              </label>
              <input
                type="text"
                id="dose"
                value={formData.dose}
                onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                
              placeholder="ej., 500 mg, 10 mg"
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
              />
            </div>

            <div>
              <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-1">
                Vía
              </label>
              <input
                type="text"
                id="route"
                value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                
              placeholder="ej., oral, IV, tópica"
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
              />
            </div>

            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia
              </label>
              <input
                type="text"
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                
              placeholder="ej., dos veces al día, cada 8 horas"
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
              />
            </div>
          </div>

          {/* Instrucciones de Dosificación */}
          <div>
            <label htmlFor="dosage_text" className="block text-sm font-medium text-gray-700 mb-1">
              Instrucciones de Dosificación
            </label>
            <textarea
              id="dosage_text"
              value={formData.dosage_text}
              onChange={(e) => setFormData({ ...formData, dosage_text: e.target.value })}
              rows={2}
              placeholder="ej., Tome 1 tableta por vía oral dos veces al día con alimentos"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
            />
          </div>

          {/* Casilla PRN */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_prn"
              checked={formData.is_prn}
              onChange={(e) => setFormData({ ...formData, is_prn: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              
            />
            <label htmlFor="is_prn" className="ml-2 block text-sm text-gray-700">
              PRN (Según Necesidad) <span className="text-xs text-gray-500">- no programado</span>
            </label>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                id="start_date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin <span className="text-xs text-gray-500">(si aplica)</span>
              </label>
              <input
                type="date"
                id="end_date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
              />
            </div>
          </div>

          {/* Razón */}
          <div>
            <label htmlFor="reason_text" className="block text-sm font-medium text-gray-700 mb-1">
              Razón para Tomar
            </label>
            <input
              type="text"
              id="reason_text"
              value={formData.reason_text}
              onChange={(e) => setFormData({ ...formData, reason_text: e.target.value })}
              
              placeholder="ej., Hipertensión, Diabetes Tipo 2, Infección"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
            />
          </div>

          {/* Prescriptor y Farmacia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prescriber_name" className="block text-sm font-medium text-gray-700 mb-1">
                Prescriptor
              </label>
              <input
                type="text"
                id="prescriber_name"
                value={formData.prescriber_name}
                onChange={(e) => setFormData({ ...formData, prescriber_name: e.target.value })}
                
              placeholder="Dr. Nombre"
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
              />
            </div>

            <div>
              <label htmlFor="pharmacy" className="block text-sm font-medium text-gray-700 mb-1">
                Farmacia
              </label>
              <input
                type="text"
                id="pharmacy"
                value={formData.pharmacy}
                onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
                
              placeholder="Nombre de farmacia"
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
              />
            </div>
          </div>

          {/* Recargas */}
          <div>
            <label htmlFor="refills_remaining" className="block text-sm font-medium text-gray-700 mb-1">
              Recargas Restantes
            </label>
            <input
              type="number"
              id="refills_remaining"
              value={formData.refills_remaining ?? ''}
              onChange={(e) => setFormData({ ...formData, refills_remaining: e.target.value ? parseInt(e.target.value) : null })}
              min="0"
              
              placeholder="0"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
            />
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas Adicionales
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Cualquier nota adicional, efectos secundarios u observaciones"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent `}
            />
          </div>

          {/* Mensaje de Error */}
          {formErrors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{formErrors.submit}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Guardando...' : editingMedication ? 'Actualizar Medicamento' : 'Agregar Medicamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
