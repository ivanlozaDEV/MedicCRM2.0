'use client'

import { useState, useEffect } from 'react'
import { patientContactService, type PatientContact, type CreatePatientContactData } from '@/lib/services'
import { usePermissions, PermissionGuard } from '@/lib/hooks/usePermissions'
import { 
  PlusIcon, 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface EmergencyContactsTabProps {
  patientId: number
}

export default function EmergencyContactsTab({ patientId }: EmergencyContactsTabProps) {
  const { hasPermission } = usePermissions()
  const [contacts, setContacts] = useState<PatientContact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<PatientContact | null>(null)

  useEffect(() => {
    fetchContacts()
  }, [patientId])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await patientContactService.getByPatientId(patientId)
      setContacts(response.data)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetPrimary = async (contactId: number) => {
    if (!hasPermission('patient_contacts.set_primary')) {
      alert('No tienes permiso para establecer contacto primario')
      return
    }

    try {
      await patientContactService.setPrimary(contactId)
      await fetchContacts()
    } catch (error) {
      console.error('Error setting primary contact:', error)
      alert('Error al establecer contacto primario')
    }
  }

  const handleMoveUp = async (contactId: number) => {
    if (!hasPermission('patient_contacts.reorder')) {
      alert('No tienes permiso para reordenar contactos')
      return
    }

    try {
      const currentIndex = contacts.findIndex(c => c.id === contactId)
      if (currentIndex > 0) {
        // Swap the IDs to reorder
        const reorderedIds = contacts.map(c => c.id)
        const temp = reorderedIds[currentIndex]
        reorderedIds[currentIndex] = reorderedIds[currentIndex - 1]
        reorderedIds[currentIndex - 1] = temp
        
        await patientContactService.reorder(patientId, reorderedIds)
        await fetchContacts()
      }
    } catch (error) {
      console.error('Error moving contact up:', error)
      alert('Error al reordenar contacto')
    }
  }

  const handleMoveDown = async (contactId: number) => {
    if (!hasPermission('patient_contacts.reorder')) {
      alert('No tienes permiso para reordenar contactos')
      return
    }

    try {
      const currentIndex = contacts.findIndex(c => c.id === contactId)
      if (currentIndex < contacts.length - 1) {
        // Swap the IDs to reorder
        const reorderedIds = contacts.map(c => c.id)
        const temp = reorderedIds[currentIndex]
        reorderedIds[currentIndex] = reorderedIds[currentIndex + 1]
        reorderedIds[currentIndex + 1] = temp
        
        await patientContactService.reorder(patientId, reorderedIds)
        await fetchContacts()
      }
    } catch (error) {
      console.error('Error moving contact down:', error)
      alert('Error al reordenar contacto')
    }
  }

  const handleDelete = async (contactId: number) => {
    if (!hasPermission('patient_contacts.delete')) {
      alert('No tienes permiso para eliminar contactos')
      return
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      return
    }

    try {
      await patientContactService.delete(contactId)
      await fetchContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Error al eliminar contacto')
    }
  }

  const handleEdit = (contact: PatientContact) => {
    setEditingContact(contact)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingContact(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    fetchContacts()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Contactos de Emergencia
        </h3>
        <PermissionGuard permission="patient_contacts.create">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Agregar Contacto
          </button>
        </PermissionGuard>
      </div>

      {/* Contact List */}
      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
          <PhoneIcon className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-2 text-sm font-medium text-blue-900 dark:text-blue-100">
            No hay contactos de emergencia
          </h3>
          <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
            Agrega contactos de emergencia para el paciente.
          </p>
          <PermissionGuard permission="patient_contacts.create">
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Agregar primer contacto
              </button>
            </div>
          </PermissionGuard>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact, index) => (
            <div
              key={contact.id}
              className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow ${
                contact.priority.is_primary ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              {/* Primary Badge */}
              {contact.priority.is_primary && (
                <div className="flex items-center gap-2 mb-4">
                  <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Contacto Principal
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Name and Relationship */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                        {contact.personal_info.full_name}
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {contact.personal_info.relationship}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300">
                      Prioridad #{contact.priority.priority_order}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      {contact.contact_info.phone}
                      {contact.contact_info.mobile_phone && (
                        <span className="ml-2 text-blue-500">
                          / {contact.contact_info.mobile_phone}
                        </span>
                      )}
                    </div>

                    {contact.contact_info.email && (
                      <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        {contact.contact_info.email}
                      </div>
                    )}

                    {contact.contact_info.address.full_address && (
                      <div className="flex items-start text-sm text-blue-600 dark:text-blue-400">
                        <MapPinIcon className="h-4 w-4 mr-2 mt-0.5" />
                        <span>{contact.contact_info.address.full_address}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {contact.notes && (
                    <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Notas:</p>
                      <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">{contact.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="ml-4 flex flex-col gap-2">
                  {/* Reorder buttons */}
                  <PermissionGuard permission="patient_contacts.reorder">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMoveUp(contact.id)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover arriba"
                      >
                        <ChevronUpIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(contact.id)}
                        disabled={index === contacts.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover abajo"
                      >
                        <ChevronDownIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </PermissionGuard>

                  {/* Set Primary */}
                  <PermissionGuard permission="patient_contacts.set_primary">
                    {!contact.priority.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(contact.id)}
                        className="p-1 text-gray-400 hover:text-yellow-500"
                        title="Establecer como primario"
                      >
                        <StarIcon className="h-5 w-5" />
                      </button>
                    )}
                  </PermissionGuard>

                  {/* Edit */}
                  <PermissionGuard permission="patient_contacts.update">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </PermissionGuard>

                  {/* Delete */}
                  <PermissionGuard permission="patient_contacts.delete">
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Form Modal */}
      {showForm && (
        <ContactForm
          patientId={patientId}
          contact={editingContact}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

// Contact Form Component
interface ContactFormProps {
  patientId: number
  contact: PatientContact | null
  onClose: () => void
  onSuccess: () => void
}

interface ContactFormData {
  first_name: string
  last_name: string
  relationship: string
  custom_relationship: string
  phone: string
  mobile_phone: string
  email: string
  line1: string
  line2: string
  city: string
  state: string
  postal_code: string
  country: string
  notes: string
}

function ContactForm({ patientId, contact, onClose, onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    first_name: contact?.personal_info.first_name || '',
    last_name: contact?.personal_info.last_name || '',
    relationship: contact?.personal_info.relationship || '',
    custom_relationship: '',
    phone: contact?.contact_info.phone || '',
    mobile_phone: contact?.contact_info.mobile_phone || '',
    email: contact?.contact_info.email || '',
    line1: contact?.contact_info.address.line1 || '',
    line2: contact?.contact_info.address.line2 || '',
    city: contact?.contact_info.address.city || '',
    state: contact?.contact_info.address.state || '',
    postal_code: contact?.contact_info.address.postal_code || '',
    country: contact?.contact_info.address.country || '',
    notes: contact?.notes || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Use custom relationship if "Otro" is selected
      const finalRelationship = formData.relationship === 'Otro' 
        ? formData.custom_relationship 
        : formData.relationship

      if (formData.relationship === 'Otro' && !formData.custom_relationship.trim()) {
        setError('Por favor especifica la relación personalizada')
        setLoading(false)
        return
      }

      const contactData: CreatePatientContactData = {
        patient_id: patientId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        relationship: finalRelationship,
        phone: formData.phone,
        mobile_phone: formData.mobile_phone || undefined,
        email: formData.email || undefined,
        address_line1: formData.line1 || undefined,
        address_line2: formData.line2 || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postal_code: formData.postal_code || undefined,
        country: formData.country || undefined,
        notes: formData.notes || undefined,
      }

      if (contact) {
        const { patient_id, ...updateData } = contactData
        await patientContactService.update(contact.id, updateData)
      } else {
        await patientContactService.create(contactData)
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving contact:', error)
      setError('Error al guardar contacto. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {contact ? 'Editar Contacto' : 'Nuevo Contacto de Emergencia'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Relación *
                </label>
                <select
                  required
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value, custom_relationship: '' })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Padre/Madre">Padre/Madre</option>
                  <option value="Hijo/Hija">Hijo/Hija</option>
                  <option value="Esposo/Esposa">Esposo/Esposa</option>
                  <option value="Hermano/Hermana">Hermano/Hermana</option>
                  <option value="Abuelo/Abuela">Abuelo/Abuela</option>
                  <option value="Tío/Tía">Tío/Tía</option>
                  <option value="Primo/Prima">Primo/Prima</option>
                  <option value="Amigo/Amiga">Amigo/Amiga</option>
                  <option value="Tutor Legal">Tutor Legal</option>
                  <option value="Otro">Otro (Especificar)</option>
                </select>
              </div>

              {formData.relationship === 'Otro' && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Especificar Relación *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.custom_relationship}
                    onChange={(e) => setFormData({ ...formData, custom_relationship: e.target.value })}
                    placeholder="Ej: Padrino, Vecino, Cuidador, etc."
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Información de Contacto
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono Móvil
                </label>
                <input
                  type="tel"
                  value={formData.mobile_phone}
                  onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Dirección
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Calle y Número
                </label>
                <input
                  type="text"
                  value={formData.line1}
                  onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Departamento, Piso, etc.
                </label>
                <input
                  type="text"
                  value={formData.line2}
                  onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado/Provincia
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código Postal
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  País
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Información adicional sobre el contacto..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Guardando...' : contact ? 'Actualizar Contacto' : 'Crear Contacto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
