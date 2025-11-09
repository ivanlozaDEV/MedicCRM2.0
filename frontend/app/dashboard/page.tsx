'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import { roleService } from '@/lib/services/roleService';
import { specialtyService } from '@/lib/services/specialtyService';

export default function DashboardPage() {
  const { user, organization, permissions } = useAuth();
  const [stats, setStats] = useState({
    userCount: 0,
    roleCount: 0,
    specialtyCount: 0,
    userLimit: 50,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Cargar estadísticas al montar
  useEffect(() => {
    loadStats();
  }, [organization]);

  const loadStats = async () => {
    if (!organization) return;

    try {
      setIsLoading(true);

      // Cargar datos en paralelo
      const [usersResponse, rolesResponse, specialtiesResponse] = await Promise.all([
        userService.getAll({ organization_id: organization.id, active_only: true }),
        roleService.getAll(organization.id),
        specialtyService.getAll({ active_only: true }),
      ]);

      setStats({
        userCount: usersResponse.count || 0,
        roleCount: rolesResponse.count || 0,
        specialtyCount: specialtiesResponse.count || 0,
        userLimit: 50, // TODO: Obtener del plan de suscripción
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

    // TODO: Estos datos deberían venir del backend según los permisos del usuario
  const statsCards = [
    {
      title: 'Usuarios Activos',
      value: stats.userCount,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      colorClass: 'bg-blue-600',
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
    },
  ];

  // Helper para verificar permisos
  const hasPermission = (permission: string) => {
    return permissions.includes(permission) || permissions.includes('all');
  };

  // TODO: Esto debería venir del contexto de autenticación
  const userPermissions = {
    canCreateUser: hasPermission('create_user') || hasPermission('manage_users'),
    canCreateRole: hasPermission('create_role') || hasPermission('manage_roles'),
    canViewTeam: hasPermission('view_users') || hasPermission('manage_users'),
    canViewRoles: hasPermission('view_roles') || hasPermission('manage_roles'),
    canViewPermissions: hasPermission('view_permissions') || hasPermission('manage_permissions'),
    canViewSpecialties: hasPermission('view_specialties') || hasPermission('manage_specialties'),
  };

  const quickActions = [
    {
      title: 'Agregar Usuario',
      description: 'Invitar nuevo miembro al equipo',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      href: '/dashboard/team?action=create',
      color: 'text-blue-600 bg-blue-50',
      permission: userPermissions.canCreateUser,
    },
    {
      title: 'Crear Rol',
      description: 'Configurar nuevo rol con permisos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      href: '/dashboard/roles?action=create',
      color: 'text-purple-600 bg-purple-50',
      permission: userPermissions.canCreateRole,
    },
    {
      title: 'Ver Equipo',
      description: 'Gestionar usuarios y asignaciones',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: '/dashboard/team',
      color: 'text-green-600 bg-green-50',
      permission: userPermissions.canViewTeam,
    },
    {
      title: 'Configurar Permisos',
      description: 'Asignar permisos a roles',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      href: '/dashboard/permissions',
      color: 'text-orange-600 bg-orange-50',
      permission: userPermissions.canViewPermissions,
    },
  ];

  const visibleActions = quickActions.filter(action => action.permission);

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
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600 mt-1">Bienvenido de nuevo, aquí está el resumen de tu organización</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            colorClass={stat.colorClass}
          />
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className={`${action.color} rounded-lg p-2`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{action.description}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600">{activity.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-gray-600">{activity.action}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link 
              href="/dashboard/activity" 
              className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium mt-4 pt-4 border-t border-gray-200"
            >
              Ver toda la actividad
            </Link>
          </div>
        </div>
      </div>

      {/* Subscription Alert (if needed) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-900">Plan Professional</h3>
            <p className="text-sm text-blue-700 mt-1">
              Estás usando 24 de 50 usuarios disponibles. 
              <Link href="/dashboard/subscription" className="font-medium underline ml-1">
                Mejorar plan
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
