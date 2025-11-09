'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Permission {
  id: number;
  module_key: string;
  display_name: string;
  description: string;
  category: string;
}

interface GroupedPermissions {
  system: Permission[];
  clinical: Permission[];
  administrative: Permission[];
}

export default function PermissionsPage() {
  const { user, permissions, roles } = useAuth();
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({
    system: [],
    clinical: [],
    administrative: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, [permissions]);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);

      // Obtener todos los permisos del sistema
      const response = await fetch('http://localhost:5001/api/permissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // El endpoint devuelve los permisos directamente en data (array)
          const allPerms = data.data || [];
          setAllPermissions(allPerms);

          // Filtrar solo los permisos que el usuario tiene
          const userPermissions = allPerms.filter((perm: Permission) =>
            permissions.includes(perm.module_key)
          );

          // Agrupar por categoría
          const grouped: GroupedPermissions = {
            system: userPermissions.filter((p: Permission) => p.category === 'system'),
            clinical: userPermissions.filter((p: Permission) => p.category === 'clinical'),
            administrative: userPermissions.filter((p: Permission) => p.category === 'administrative'),
          };

          setGroupedPermissions(grouped);
        }
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'clinical':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'administrative':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'clinical':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'administrative':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'system':
        return 'Sistema';
      case 'clinical':
        return 'Clínico';
      case 'administrative':
        return 'Administrativo';
      default:
        return category;
    }
  };

  const primaryRole = roles.find(r => r.is_primary);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Permisos</h1>
        <p className="text-gray-600 mt-1">
          Permisos asignados a tu cuenta a través de tus roles
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user?.first_name} {user?.last_name}
            </h3>
            <p className="text-gray-600 mt-1">{user?.email}</p>
          </div>
          {primaryRole && (
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: primaryRole.color + '20',
                  color: primaryRole.color,
                }}
              >
                {primaryRole.name}
              </span>
            </div>
          )}
        </div>

        {/* Roles Summary */}
        {roles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tus Roles</h4>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <span
                  key={role.id}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: role.color + '20',
                    color: role.color,
                  }}
                >
                  {role.name}
                  {role.is_primary && (
                    <span className="ml-1 text-xs opacity-70">(Principal)</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total de Permisos</p>
              <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sistema</p>
              <p className="text-2xl font-bold text-blue-600">{groupedPermissions.system.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Clínico</p>
              <p className="text-2xl font-bold text-green-600">{groupedPermissions.clinical.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Permissions by Category */}
      {!isLoading && (
        <div className="space-y-6">
          {(['system', 'clinical', 'administrative'] as const).map((category) => {
            const categoryPerms = groupedPermissions[category];
            
            if (categoryPerms.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Category Header */}
                <div className={`px-6 py-4 border-b ${getCategoryColor(category)}`}>
                  <div className="flex items-center gap-3">
                    <div className="opacity-70">
                      {getCategoryIcon(category)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">
                        {getCategoryTitle(category)}
                      </h2>
                      <p className="text-sm opacity-80 mt-0.5">
                        {categoryPerms.length} permiso{categoryPerms.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permissions List */}
                <div className="divide-y divide-gray-200">
                  {categoryPerms.map((permission) => (
                    <div
                      key={permission.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <svg
                              className="w-5 h-5 text-green-600 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {permission.display_name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-0.5">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded ml-4 flex-shrink-0">
                          {permission.module_key}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && permissions.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes permisos asignados
          </h3>
          <p className="text-gray-600">
            Contacta con un administrador para que te asigne permisos.
          </p>
        </div>
      )}
    </div>
  );
}
