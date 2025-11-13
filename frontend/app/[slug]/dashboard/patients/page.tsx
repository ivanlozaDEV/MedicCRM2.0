'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { patientService, type Patient } from '@/lib/services'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions, PermissionGuard } from '@/lib/hooks/usePermissions'
import { useOrganizationSlug } from '@/lib/hooks/useOrganizationSlug'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

export default function PatientsPage() {
  const router = useRouter()
  const { organization } = useAuth()
  const { slug } = useOrganizationSlug()
  const { hasPermission, isLoading: permissionsLoading } = usePermissions()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [genderFilter, setGenderFilter] = useState<string>('all')

  // Check permission
  useEffect(() => {
    if (!permissionsLoading && !hasPermission('patients.view')) {
      router.push(`/${slug}/dashboard`)
    }
  }, [hasPermission, permissionsLoading, router, slug])

  // Fetch patients
  useEffect(() => {
    if (organization) {
      fetchPatients()
    }
  }, [organization, search, statusFilter, genderFilter])

  const fetchPatients = async () => {
    if (!organization) return
    
    try {
      setLoading(true)
      const params: any = {
        organization_id: organization.id,
        include_contacts: false
      }
      
      if (search) params.search = search
      if (statusFilter === 'active') params.active_only = true
      else if (statusFilter === 'inactive') params.active_only = false
      
      const response = await patientService.getAll(params)
      
      if (response.success) {
        // Client-side gender filter if needed
        let filtered = response.data
        if (genderFilter !== 'all') {
          filtered = response.data.filter(p => p.personal_info.gender === genderFilter)
        }
        
        setPatients(filtered)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePatient = () => {
    router.push(`/${slug}/dashboard/patients/new`)
  }

  const handleViewPatient = (id: number) => {
    router.push(`/${slug}/dashboard/patients/${id}`)
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Activo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Inactivo
      </span>
    )
  }

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      male: 'Masculino',
      female: 'Femenino',
      other: 'Otro',
      unknown: 'No especificado'
    }
    return labels[gender] || gender
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

  if (!hasPermission('patients.view')) {
    return null
  }

  if (permissionsLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-500">Cargando permisos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona la información de tus pacientes
          </p>
        </div>
        <PermissionGuard permission="patients.create">
          <button
            onClick={handleCreatePatient}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Paciente
          </button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Todos los géneros</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
              <option value="unknown">No especificado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Cargando pacientes...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pacientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando un nuevo paciente
            </p>
            <PermissionGuard permission="patients.create">
              <div className="mt-6">
                <button
                  onClick={handleCreatePatient}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nuevo Paciente
                </button>
              </div>
            </PermissionGuard>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Género / Edad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo Sangre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewPatient(patient.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {patient.personal_info.first_name[0]}{patient.personal_info.last_name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.personal_info.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.identification.id_number || 'Sin ID'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {patient.contact_info.phone || patient.contact_info.mobile_phone || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {patient.contact_info.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getGenderLabel(patient.personal_info.gender || 'unknown')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {patient.personal_info.age || calculateAge(patient.personal_info.date_of_birth)} años
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.medical_info.blood_type || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(patient.is_active)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewPatient(patient.id)
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      <PermissionGuard permission="patients.stats">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-blue-50 overflow-hidden rounded-lg px-4 py-5">
              <div className="text-sm font-medium text-blue-600 truncate">
                Total de Pacientes
              </div>
              <div className="mt-1 text-3xl font-semibold text-blue-900">
                {patients.length}
              </div>
            </div>
            <div className="bg-green-50 overflow-hidden rounded-lg px-4 py-5">
              <div className="text-sm font-medium text-green-600 truncate">
                Pacientes Activos
              </div>
              <div className="mt-1 text-3xl font-semibold text-green-900">
                {patients.filter(p => p.is_active).length}
              </div>
            </div>
            <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5">
              <div className="text-sm font-medium text-gray-600 truncate">
                Pacientes Inactivos
              </div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">
                {patients.filter(p => !p.is_active).length}
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>
    </div>
  )
}
