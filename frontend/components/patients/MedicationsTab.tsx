'use client'

import { useState, useEffect } from 'react'
import { patientMedicationService, type PatientMedication, medicationService, type MedicationCatalog } from '@/lib/services'
import { usePermissions, PermissionGuard } from '@/lib/hooks/usePermissions'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface MedicationsTabProps {
  patientId: number
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

export default function MedicationsTab({ patientId }: MedicationsTabProps) {
  const { hasPermission } = usePermissions()
  const [medications, setMedications] = useState<PatientMedication[]>([])
  const [medicationCatalog, setMedicationCatalog] = useState<MedicationCatalog[]>([])
  const [filteredCatalog, setFilteredCatalog] = useState<MedicationCatalog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCatalogMedication, setSelectedCatalogMedication] = useState<MedicationCatalog | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<PatientMedication | null>(null)
  const [formData, setFormData] = useState<MedicationFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [useCustomMedication, setUseCustomMedication] = useState(false)

  useEffect(() => {
    fetchMedications()
  }, [patientId])

  useEffect(() => {
    if (isModalOpen) {
      fetchMedicationCatalog()
    }
  }, [isModalOpen])

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

  const fetchMedicationCatalog = async () => {
    try {
      const medications = await medicationService.getAll({ is_active: true })
      setMedicationCatalog(medications)
      setFilteredCatalog(medications)
    } catch (error) {
      console.error('Error fetching medication catalog:', error)
    }
  }

  // Fuzzy search implementation
  const fuzzyMatch = (str: string, pattern: string): boolean => {
    const patternLower = pattern.toLowerCase()
    const strLower = str.toLowerCase()
    
    // Exact substring match
    if (strLower.includes(patternLower)) return true
    
    // Fuzzy match - all characters in order
    let patternIdx = 0
    for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
      if (strLower[i] === patternLower[patternIdx]) {
        patternIdx++
      }
    }
    return patternIdx === patternLower.length
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setShowSuggestions(true)
    
    if (!value.trim()) {
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
    
    // Auto-fill form with catalog data
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

  const openModal = (medication?: PatientMedication) => {
    if (medication) {
      setEditingMedication(medication)
      setFormData({
        medication_id: medication.medication_id || null,
        medication_name: medication.medication_name,
        medication_code: medication.medication_code || '',
        medication_system: medication.medication_system || '',
        status: medication.status,
        dosage_text: medication.dosage_text || '',
        dose: medication.dose || '',
        route: medication.route || '',
        frequency: medication.frequency || '',
        start_date: medication.start_date || '',
        end_date: medication.end_date || '',
        reason_code: medication.reason_code || '',
        reason_text: medication.reason_text || '',
        prescriber_name: medication.prescriber_name || '',
        pharmacy: medication.pharmacy || '',
        refills_remaining: medication.refills_remaining || null,
        is_prn: medication.is_prn || false,
        notes: medication.notes || ''
      })
      
      // If editing and has catalog medication, pre-select it
      if (medication.medication_id) {
        const catalogMed = medicationCatalog.find(m => m.id === medication.medication_id)
        if (catalogMed) {
          setSelectedCatalogMedication(catalogMed)
          setSearchQuery(catalogMed.name)
        }
      } else {
        setSearchQuery(medication.medication_name)
        setUseCustomMedication(true)
      }
    } else {
      setEditingMedication(null)
      setFormData(initialFormData)
      setSearchQuery('')
      setSelectedCatalogMedication(null)
      setUseCustomMedication(false)
    }
    setFormErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMedication(null)
    setFormData(initialFormData)
    setFormErrors({})
    setSearchQuery('')
    setSelectedCatalogMedication(null)
    setUseCustomMedication(false)
    setShowSuggestions(false)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.medication_name.trim()) {
      errors.medication_name = 'Medication name is required'
    }

    if (!formData.status) {
      errors.status = 'Status is required'
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

      await fetchMedications()
      closeModal()
    } catch (error: any) {
      console.error('Error saving medication:', error)
      setFormErrors({ 
        submit: error.response?.data?.error || 'Failed to save medication' 
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (medicationId: number) => {
    if (!confirm('Are you sure you want to delete this medication?')) {
      return
    }

    try {
      await patientMedicationService.delete(patientId, medicationId)
      await fetchMedications()
    } catch (error) {
      console.error('Error deleting medication:', error)
      alert('Failed to delete medication')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Active' },
      completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircleIcon, label: 'Completed' },
      stopped: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Stopped' },
      'on-hold': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'On Hold' }
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
          <h3 className="text-lg font-medium text-gray-900">Medications</h3>
          <p className="mt-1 text-sm text-gray-500">
            Current and past medications following FHIR MedicationStatement
          </p>
        </div>
        <PermissionGuard permission="patient_medications.create">
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Medication
          </button>
        </PermissionGuard>
      </div>

      {/* Medications List */}
      {medications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No medications recorded</p>
          <PermissionGuard permission="patient_medications.create">
            <button
              onClick={() => openModal()}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add first medication
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
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {medication.medication_name}
                    </h4>
                    {getStatusBadge(medication.status)}
                    {medication.is_prn && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        PRN
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {medication.dose && (
                      <div>
                        <span className="font-medium text-gray-700">Dose:</span>
                        <span className="ml-2 text-gray-600">{medication.dose}</span>
                      </div>
                    )}
                    {medication.route && (
                      <div>
                        <span className="font-medium text-gray-700">Route:</span>
                        <span className="ml-2 text-gray-600">{medication.route}</span>
                      </div>
                    )}
                    {medication.frequency && (
                      <div>
                        <span className="font-medium text-gray-700">Frequency:</span>
                        <span className="ml-2 text-gray-600">{medication.frequency}</span>
                      </div>
                    )}
                    {medication.start_date && (
                      <div>
                        <span className="font-medium text-gray-700">Started:</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(medication.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {medication.end_date && (
                      <div>
                        <span className="font-medium text-gray-700">Ended:</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(medication.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {medication.reason_text && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Reason:</span>
                        <span className="ml-2 text-gray-600">{medication.reason_text}</span>
                      </div>
                    )}
                    {medication.prescriber_name && (
                      <div>
                        <span className="font-medium text-gray-700">Prescriber:</span>
                        <span className="ml-2 text-gray-600">{medication.prescriber_name}</span>
                      </div>
                    )}
                    {medication.pharmacy && (
                      <div>
                        <span className="font-medium text-gray-700">Pharmacy:</span>
                        <span className="ml-2 text-gray-600">{medication.pharmacy}</span>
                      </div>
                    )}
                    {medication.refills_remaining !== null && medication.refills_remaining !== undefined && (
                      <div>
                        <span className="font-medium text-gray-700">Refills:</span>
                        <span className="ml-2 text-gray-600">{medication.refills_remaining}</span>
                      </div>
                    )}
                    {medication.dosage_text && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Instructions:</span>
                        <span className="ml-2 text-gray-600">{medication.dosage_text}</span>
                      </div>
                    )}
                    {medication.notes && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Notes:</span>
                        <span className="ml-2 text-gray-600">{medication.notes}</span>
                      </div>
                    )}
                  </div>

                  {medication.medication_code && (
                    <div className="mt-2 text-xs text-gray-500">
                      Code: {medication.medication_code}
                      {medication.medication_system && ` (${medication.medication_system})`}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <PermissionGuard permission="patient_medications.update">
                    <button
                      onClick={() => openModal(medication)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit medication"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permission="patient_medications.delete">
                    <button
                      onClick={() => handleDelete(medication.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete medication"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingMedication ? 'Edit Medication' : 'Add New Medication'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Medication Search / Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Medication Catalog
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type medication name (e.g., Amoxicillin, Lisinopril)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                <div className="text-sm text-gray-600">Generic: {med.generic_name}</div>
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
                      {searchQuery.trim() && (
                        <button
                          type="button"
                          onClick={handleCustomMedication}
                          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 border-t-2 border-gray-300"
                        >
                          <div className="text-sm font-medium text-blue-600">
                            ➕ Add custom medication: &quot;{searchQuery}&quot;
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Not found in catalog - add manually
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Catalog Info Card */}
                {selectedCatalogMedication && !useCustomMedication && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900">{selectedCatalogMedication.name}</h4>
                        {selectedCatalogMedication.generic_name && (
                          <p className="text-sm text-blue-700 mt-1">
                            Generic: {selectedCatalogMedication.generic_name}
                          </p>
                        )}
                        {selectedCatalogMedication.brand_names && selectedCatalogMedication.brand_names.length > 0 && (
                          <p className="text-sm text-blue-700">
                            Brand names: {selectedCatalogMedication.brand_names.join(', ')}
                          </p>
                        )}
                        {selectedCatalogMedication.description && (
                          <p className="text-sm text-blue-600 mt-2">{selectedCatalogMedication.description}</p>
                        )}
                        {selectedCatalogMedication.common_indications && selectedCatalogMedication.common_indications.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-blue-900">Common uses:</span>
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
                      ℹ️ Adding custom medication not in catalog. Please fill in all details manually.
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
                  }`}
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
                  Status * <span className="text-xs text-gray-500">(medication active status)</span>
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active - Currently taking</option>
                  <option value="completed">Completed - Course finished</option>
                  <option value="stopped">Stopped - Discontinued</option>
                  <option value="on-hold">On Hold - Temporarily paused</option>
                </select>
              </div>

              {/* Dosage Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="dose" className="block text-sm font-medium text-gray-700 mb-1">
                    Dose
                  </label>
                  <input
                    type="text"
                    id="dose"
                    value={formData.dose}
                    onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                    placeholder="e.g., 500 mg, 10 mg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-1">
                    Route
                  </label>
                  <input
                    type="text"
                    id="route"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    placeholder="e.g., oral, IV, topical"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    placeholder="e.g., twice daily, every 8 hours"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Dosage Text Instructions */}
              <div>
                <label htmlFor="dosage_text" className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage Instructions
                </label>
                <textarea
                  id="dosage_text"
                  value={formData.dosage_text}
                  onChange={(e) => setFormData({ ...formData, dosage_text: e.target.value })}
                  rows={2}
                  placeholder="e.g., Take 1 tablet by mouth twice daily with food"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* PRN Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_prn"
                  checked={formData.is_prn}
                  onChange={(e) => setFormData({ ...formData, is_prn: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_prn" className="ml-2 block text-sm text-gray-700">
                  PRN (As Needed) <span className="text-xs text-gray-500">- not scheduled</span>
                </label>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-xs text-gray-500">(if applicable)</span>
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="reason_text" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Taking
                </label>
                <input
                  type="text"
                  id="reason_text"
                  value={formData.reason_text}
                  onChange={(e) => setFormData({ ...formData, reason_text: e.target.value })}
                  placeholder="e.g., Hypertension, Type 2 Diabetes, Infection"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Prescriber and Pharmacy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prescriber_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Prescriber
                  </label>
                  <input
                    type="text"
                    id="prescriber_name"
                    value={formData.prescriber_name}
                    onChange={(e) => setFormData({ ...formData, prescriber_name: e.target.value })}
                    placeholder="Dr. Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="pharmacy" className="block text-sm font-medium text-gray-700 mb-1">
                    Pharmacy
                  </label>
                  <input
                    type="text"
                    id="pharmacy"
                    value={formData.pharmacy}
                    onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
                    placeholder="Pharmacy name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Refills */}
              <div>
                <label htmlFor="refills_remaining" className="block text-sm font-medium text-gray-700 mb-1">
                  Refills Remaining
                </label>
                <input
                  type="number"
                  id="refills_remaining"
                  value={formData.refills_remaining ?? ''}
                  onChange={(e) => setFormData({ ...formData, refills_remaining: e.target.value ? parseInt(e.target.value) : null })}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Any additional notes, side effects, or observations"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Error Message */}
              {formErrors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{formErrors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingMedication ? 'Update Medication' : 'Add Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
