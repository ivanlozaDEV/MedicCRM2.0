'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { patientService, type Patient } from '@/lib/services'
import { usePermissions, PermissionGuard } from '@/lib/hooks/usePermissions'
import { 
  ArrowLeftIcon, 
  PencilIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  HeartIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import EmergencyContactsTab from '@/components/patients/EmergencyContactsTab'
import AllergiesTab from '@/components/patients/AllergiesTab'

type TabType = 'general' | 'contacts' | 'allergies' | 'medications' | 'conditions'

export default function PatientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const patientId = parseInt(params.id as string)
  const { hasPermission } = usePermissions()
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [isEditing, setIsEditing] = useState(false)

  // Check permission
  useEffect(() => {
    if (!hasPermission('patients.view')) {
      router.push('/dashboard/patients')
    }
  }, [hasPermission, router])

  // Fetch patient data
  useEffect(() => {
    if (patientId) {
      fetchPatient()
    }
  }, [patientId])

  const fetchPatient = async () => {
    try {
      setLoading(true)
      const response = await patientService.getById(patientId, true) // include contacts
      if (response.success) {
        setPatient(response.data)
      }
    } catch (error) {
      console.error('Error fetching patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async () => {
    if (!patient || !hasPermission('patients.activate')) return
    
    try {
      const response = await patientService.activate(patientId)
      if (response.success) {
        setPatient(response.data)
      }
    } catch (error) {
      console.error('Error activating patient:', error)
    }
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getGenderLabel = (gender?: string) => {
    const labels: Record<string, string> = {
      male: 'Masculino',
      female: 'Femenino',
      other: 'Otro',
      unknown: 'No especificado'
    }
    return labels[gender || 'unknown'] || 'No especificado'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-500">Cargando paciente...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Paciente no encontrado</p>
        <button
          onClick={() => router.push('/dashboard/patients')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Volver a la lista
        </button>
      </div>
    )
  }

  const tabs = [
    { id: 'general', label: 'Información General', icon: UserIcon },
    { id: 'contacts', label: 'Contactos de Emergencia', icon: PhoneIcon, permission: 'patient_contacts.view' },
    { id: 'allergies', label: 'Alergias', icon: HeartIcon, permission: 'patient_allergies.view' },
    { id: 'medications', label: 'Medicamentos', icon: CalendarIcon, permission: 'patient_medications.view' },
    { id: 'conditions', label: 'Condiciones', icon: IdentificationIcon, permission: 'patient_conditions.view' },
  ]

  const visibleTabs = tabs.filter(tab => !tab.permission || hasPermission(tab.permission))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/patients')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {patient.personal_info.full_name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {patient.identification.id_number || 'Sin ID'} • {' '}
              {getGenderLabel(patient.personal_info.gender)} • {' '}
              {patient.personal_info.age || calculateAge(patient.personal_info.date_of_birth)} años
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <PermissionGuard permission="patients.activate">
            <button
              onClick={handleActivate}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                patient.is_active
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {patient.is_active ? 'Desactivar' : 'Activar'}
            </button>
          </PermissionGuard>
          <PermissionGuard permission="patients.update">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          patient.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {patient.is_active ? '● Activo' : '○ Inactivo'}
        </span>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'general' && (
          <GeneralInfoTab patient={patient} isEditing={isEditing} onUpdate={fetchPatient} />
        )}
        {activeTab === 'contacts' && (
          <EmergencyContactsTab patientId={patientId} />
        )}
        {activeTab === 'allergies' && (
          <AllergiesTab patientId={patientId} />
        )}
        {activeTab === 'medications' && (
          <div className="text-center py-12 text-gray-500">
            Tab de Medicamentos FHIR (próximamente)
          </div>
        )}
        {activeTab === 'conditions' && (
          <div className="text-center py-12 text-gray-500">
            Tab de Condiciones FHIR (próximamente)
          </div>
        )}
      </div>
    </div>
  )
}

// ===== GENERAL INFO TAB =====
function GeneralInfoTab({ 
  patient, 
  isEditing, 
  onUpdate 
}: { 
  patient: Patient
  isEditing: boolean
  onUpdate: () => void
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
          Información Personal
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
            <dd className="mt-1 text-sm text-gray-900">{patient.personal_info.full_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDate(patient.personal_info.date_of_birth)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Género</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {patient.personal_info.gender === 'male' ? 'Masculino' : 
               patient.personal_info.gender === 'female' ? 'Femenino' : 
               patient.personal_info.gender === 'other' ? 'Otro' : 'No especificado'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Edad</dt>
            <dd className="mt-1 text-sm text-gray-900">{patient.personal_info.age} años</dd>
          </div>
        </dl>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" />
          Información de Contacto
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{patient.contact_info.email || 'No especificado'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
            <dd className="mt-1 text-sm text-gray-900">{patient.contact_info.phone || 'No especificado'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Celular</dt>
            <dd className="mt-1 text-sm text-gray-900">{patient.contact_info.mobile_phone || 'No especificado'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Dirección</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {patient.contact_info.address.full_address || 'No especificada'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Identification */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <IdentificationIcon className="h-5 w-5 mr-2 text-gray-400" />
          Identificación
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Tipo de ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{patient.identification.id_type || 'No especificado'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Número de ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{patient.identification.id_number || 'No especificado'}</dd>
          </div>
        </dl>
      </div>

      {/* Medical Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <HeartIcon className="h-5 w-5 mr-2 text-gray-400" />
          Información Médica
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Tipo de Sangre</dt>
            <dd className="mt-1 text-sm text-gray-900">{patient.medical_info.blood_type || 'No especificado'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Seguro Médico</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {patient.medical_info.insurance_provider || 'Sin seguro'}
            </dd>
          </div>
          {patient.medical_info.insurance_policy_number && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Número de Póliza</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.medical_info.insurance_policy_number}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Additional Information */}
      {(patient.additional_info.occupation || patient.additional_info.marital_status || patient.additional_info.notes) && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {patient.additional_info.occupation && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Ocupación</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.additional_info.occupation}</dd>
              </div>
            )}
            {patient.additional_info.marital_status && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Estado Civil</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.additional_info.marital_status}</dd>
              </div>
            )}
            {patient.additional_info.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Notas</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.additional_info.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-6 border-t border-gray-200">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-gray-400">Creado</dt>
            <dd className="mt-1 text-xs text-gray-600">
              {new Date(patient.created_at).toLocaleString('es-ES')}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400">Última Actualización</dt>
            <dd className="mt-1 text-xs text-gray-600">
              {new Date(patient.updated_at).toLocaleString('es-ES')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
