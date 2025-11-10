'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import { roleService } from '@/lib/services/roleService';
import UserModal from '@/components/dashboard/UserModal';
import RoleModal from '@/components/dashboard/RoleModal';

export default function DashboardPage() {
  const { user, organization, permissions } = useAuth();
  const [stats, setStats] = useState({
    // Estadísticas administrativas
    userCount: 0,
    roleCount: 0,
    specialtyCount: 0,
    userLimit: 50,
    // Estadísticas clínicas (TODO: obtener del backend)
    patientsCount: 0,
    appointmentsTodayCount: 0,
    consultationsTodayCount: 0,
    pendingAppointmentsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Cargar estadísticas al montar
  useEffect(() => {
    loadStats();
  }, [organization]);

  const loadStats = async () => {
    if (!organization) return;

    try {
      setIsLoading(true);

      // Cargar datos en paralelo
      const [usersResponse, rolesResponse] = await Promise.all([
        userService.getAll({ organization_id: organization.id, active_only: true, include_specialties: true }),
        roleService.getAll(organization.id),
      ]);

      // Contar especialidades únicas que tienen los usuarios del equipo
      const uniqueSpecialties = new Set<number>();
      if (usersResponse.data && Array.isArray(usersResponse.data)) {
        usersResponse.data.forEach((user: any) => {
          const userSpecialties = user.professional_info?.specialties || user.specialties || [];
          userSpecialties.forEach((specialty: any) => {
            if (specialty.id) {
              uniqueSpecialties.add(specialty.id);
            }
          });
        });
      }

      setStats({
        // Administrativas
        userCount: usersResponse.count || 0,
        roleCount: rolesResponse.count || 0,
        specialtyCount: uniqueSpecialties.size,
        userLimit: 50, // TODO: Obtener del plan de suscripción
        // Clínicas (TODO: obtener del backend cuando estén disponibles las APIs)
        patientsCount: 0,
        appointmentsTodayCount: 0,
        consultationsTodayCount: 0,
        pendingAppointmentsCount: 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para verificar permisos
  const hasPermission = (permission: string) => {
    return permissions.includes(permission) || permissions.includes('all');
  };

  // Helper para verificar si tiene al menos uno de los permisos
  const hasAnyPermission = (permissionList: string[]) => {
    return permissionList.some(p => hasPermission(p));
  };

  // Verificar permisos del usuario por área
  const userPermissions = {
    // Clínicos
    canViewPatients: hasPermission('patients.view'),
    canCreatePatient: hasPermission('patients.create'),
    canViewAppointments: hasPermission('appointments.view'),
    canCreateAppointment: hasPermission('appointments.create'),
    canViewConsultations: hasPermission('consultations.view'),
    canCreateConsultation: hasPermission('consultations.create'),
    
    // Administrativos
    canCreateUser: hasPermission('users.create'),
    canCreateRole: hasPermission('roles.create'),
    canViewPayments: hasPermission('payments.view'),
    canCreatePayment: hasPermission('payments.create'),
    canViewServices: hasPermission('services.view'),
    canCreateService: hasPermission('services.create'),
    
    // Sistema
    canViewReports: hasPermission('reports.view'),
    canViewSettings: hasPermission('settings.view'),
    canViewAuditLogs: hasPermission('audit_logs.view'),
  };

  // Estadísticas organizadas por sección
  const clinicalStatsCards = [
    {
      title: 'Pacientes Totales',
      value: stats.patientsCount,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      colorClass: 'bg-blue-600',
      permission: userPermissions.canViewPatients,
    },
    {
      title: 'Citas Hoy',
      value: stats.appointmentsTodayCount,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      colorClass: 'bg-green-600',
      permission: userPermissions.canViewAppointments,
    },
    {
      title: 'Consultas Hoy',
      value: stats.consultationsTodayCount,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      colorClass: 'bg-teal-600',
      permission: userPermissions.canViewConsultations,
    },
    {
      title: 'Citas Pendientes',
      value: stats.pendingAppointmentsCount,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      colorClass: 'bg-orange-600',
      permission: userPermissions.canViewAppointments,
    },
  ];

  const administrativeStatsCards = [
    {
      title: 'Usuarios Activos',
      value: stats.userCount,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      colorClass: 'bg-blue-600',
      permission: hasPermission('users.view'),
    },
    {
      title: 'Roles Configurados',
      value: stats.roleCount,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      colorClass: 'bg-purple-600',
      permission: hasPermission('roles.view'),
    },
    {
      title: 'Especialidades',
      value: stats.specialtyCount,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      colorClass: 'bg-pink-600',
      permission: hasPermission('specialties.view'),
    },
    {
      title: 'Límite de Usuarios',
      value: `${stats.userCount}/${stats.userLimit}`,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      colorClass: 'bg-green-600',
      permission: hasPermission('organizations.view'),
    },
  ];

  // Combinar stats visibles según permisos
  const visibleClinicalStats = clinicalStatsCards.filter(stat => stat.permission);
  const visibleAdministrativeStats = administrativeStatsCards.filter(stat => stat.permission);
  const allVisibleStats = [...visibleClinicalStats, ...visibleAdministrativeStats];

  // Determinar qué secciones mostrar
  const sections = {
    clinical: hasAnyPermission([
      'patients.view', 'patients.create',
      'appointments.view', 'appointments.create',
      'consultations.view', 'consultations.create',
      'prescriptions.view', 'prescriptions.create'
    ]),
    administrative: hasAnyPermission([
      'users.view', 'users.create',
      'roles.view', 'roles.create',
      'payments.view', 'payments.create',
      'services.view', 'services.create'
    ]),
    system: hasAnyPermission([
      'reports.view', 'settings.view',
      'organizations.view', 'audit_logs.view'
    ])
  };

  // Acciones rápidas organizadas por sección
  const clinicalActions = [
    {
      title: 'Nueva Cita',
      description: 'Agendar cita para paciente',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      action: () => {}, // TODO: Implementar modal de citas
      color: 'text-blue-600 bg-blue-50',
      permission: userPermissions.canCreateAppointment,
    },
    {
      title: 'Nuevo Paciente',
      description: 'Registrar paciente nuevo',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      action: () => {}, // TODO: Implementar modal de pacientes
      color: 'text-green-600 bg-green-50',
      permission: userPermissions.canCreatePatient,
    },
  ];

  const administrativeActions = [
    {
      title: 'Agregar Usuario',
      description: 'Invitar nuevo miembro al equipo',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      action: () => setShowUserModal(true),
      color: 'text-blue-600 bg-blue-50',
      permission: userPermissions.canCreateUser,
    },
    {
      title: 'Crear Rol',
      description: 'Configurar nuevo rol con permisos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      action: () => setShowRoleModal(true),
      color: 'text-purple-600 bg-purple-50',
      permission: userPermissions.canCreateRole,
    },
    {
      title: 'Registrar Pago',
      description: 'Registrar pago de servicio',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      action: () => {}, // TODO: Implementar modal de pagos
      color: 'text-green-600 bg-green-50',
      permission: userPermissions.canCreatePayment,
    },
  ];

  // Combinar todas las acciones visibles
  const allQuickActions = [
    ...(sections.clinical ? clinicalActions : []),
    ...(sections.administrative ? administrativeActions : []),
  ].filter(action => action.permission);

  const visibleActions = allQuickActions.filter(action => action.permission);

  const recentActivity = [
    {
      user: 'Dr. María González',
      action: 'se unió al equipo',
      time: 'Hace 2 horas',
      avatar: 'MG',
    },
    {
      user: 'Enfermera Ana López',
      action: 'cambió su especialidad',
      time: 'Hace 5 horas',
      avatar: 'AL',
    },
    {
      user: 'Dr. Carlos Ramírez',
      action: 'actualizó sus datos de perfil',
      time: 'Hace 1 día',
      avatar: 'CR',
    },
    {
      user: 'Admin',
      action: 'creó un nuevo rol: Recepcionista',
      time: 'Hace 2 días',
      avatar: 'AD',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bienvenido, {user?.first_name}
            </h1>
            <p className="text-gray-600 mt-1">
              {organization?.name || 'Mi Organización'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-sm text-gray-500">Hoy</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Sections - Clinical & Administrative */}
      <div className="space-y-6">
        {/* Sección Clínica - Solo mostrar si tiene contenido */}
        {sections.clinical && (visibleClinicalStats.length > 0 || clinicalActions.filter(action => action.permission).length > 0) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-lg">⚕️</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Área Clínica</h2>
            </div>

              {/* Estadísticas Clínicas */}
              {visibleClinicalStats.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Estadísticas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {visibleClinicalStats.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <div className={`${stat.colorClass} rounded-md p-1.5`}>
                              <div className="w-4 h-4 flex items-center justify-center">
                                {stat.icon}
                              </div>
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-[10px] font-medium text-gray-600 mt-0.5 leading-tight">{stat.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones Rápidas Clínicas */}
              {clinicalActions.filter(action => action.permission).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Acciones Rápidas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clinicalActions.filter(action => action.permission).map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className={`flex items-start space-x-4 p-4 rounded-lg border-2 border-transparent hover:border-blue-300 hover:shadow-md transition-all w-full text-left ${action.color}`}
                      >
                        <div className="rounded-lg p-2">
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{action.title}</h3>
                          <p className="text-sm text-gray-600 mt-0.5">{action.description}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sección Administrativa - Solo mostrar si tiene contenido */}
          {sections.administrative && (visibleAdministrativeStats.length > 0 || administrativeActions.filter(action => action.permission).length > 0 || userPermissions.canViewAuditLogs) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Área Administrativa</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contenido Principal */}
                <div className={`${userPermissions.canViewAuditLogs ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                  {/* Estadísticas Administrativas */}
                  {visibleAdministrativeStats.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Estadísticas</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {visibleAdministrativeStats.map((stat, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all"
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between mb-2">
                                <div className={`${stat.colorClass} rounded-md p-1.5`}>
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    {stat.icon}
                                  </div>
                                </div>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                              <p className="text-[10px] font-medium text-gray-600 mt-0.5 leading-tight">{stat.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acciones Rápidas Administrativas */}
                  {administrativeActions.filter(action => action.permission).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Acciones Rápidas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {administrativeActions.filter(action => action.permission).map((action, index) => (
                          <button
                            key={index}
                            onClick={action.action}
                            className={`flex items-start space-x-4 p-4 rounded-lg border-2 border-transparent hover:border-purple-300 hover:shadow-md transition-all w-full text-left ${action.color}`}
                          >
                            <div className="rounded-lg p-2">
                              {action.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{action.title}</h3>
                              <p className="text-sm text-gray-600 mt-0.5">{action.description}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actividad Reciente - Solo si tiene permiso */}
                {userPermissions.canViewAuditLogs && (
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-200 p-5">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Actividad Reciente
                      </h3>
                      <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-medium text-purple-600">
                                {activity.avatar}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-900">
                                <span className="font-medium">{activity.user}</span>{' '}
                                <span className="text-gray-600">{activity.action}</span>
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link 
                        href="/dashboard/activity" 
                        className="block text-center text-xs text-purple-600 font-medium mt-4 pt-3 border-t border-purple-200 hover:underline transition-colors"
                      >
                        Ver toda la actividad →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mensaje si no hay acciones disponibles */}
          {!sections.clinical && !sections.administrative && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay acciones disponibles</h3>
                <p className="text-gray-500">Contacta al administrador para obtener permisos.</p>
              </div>
            </div>
          )}
      </div>

      {/* Subscription Alert */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg 
              className="w-5 h-5 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">Plan Professional</h3>
            <p className="text-sm text-gray-700 mt-1">
              Estás usando {stats.userCount} de {stats.userLimit} usuarios disponibles. 
              <Link 
                href="/dashboard/subscription" 
                className="font-medium text-blue-600 underline ml-1 hover:no-underline transition-all"
              >
                Mejorar plan
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSuccess={() => {
          setShowUserModal(false);
          loadStats();
        }}
        mode="create"
      />

      <RoleModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSuccess={() => {
          setShowRoleModal(false);
          loadStats();
        }}
        mode="create"
      />
    </div>
  );
}
