'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { useEffect } from 'react'

export default function DebugPermissionsPage() {
  const { user, permissions: authPermissions } = useAuth()
  const { permissions: hookPermissions, isLoading } = usePermissions()

  // Log everything to console for debugging
  useEffect(() => {
    console.log('=== DEBUG PERMISSIONS ===')
    console.log('User:', user)
    console.log('Auth Permissions:', authPermissions)
    console.log('Hook Permissions:', hookPermissions)
    console.log('Is Loading:', isLoading)
    console.log('User Roles:', user?.roles)
  }, [user, authPermissions, hookPermissions, isLoading])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Debug - Permisos de Usuario</h1>

      {/* User Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Usuario Actual</h2>
        {user ? (
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Nombre:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Organización ID:</strong> {user.organization_id}</p>
            <p><strong>Roles:</strong> {user.roles?.length || 0}</p>
          </div>
        ) : (
          <p className="text-gray-500">No hay usuario logueado</p>
        )}
      </div>

      {/* Permissions from AuthContext */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Permisos (AuthContext)</h2>
        {authPermissions.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {authPermissions.map((perm, idx) => (
              <li key={idx} className="text-sm">{perm}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay permisos en AuthContext</p>
        )}
      </div>

      {/* Permissions from Hook */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Permisos (usePermissions Hook)</h2>
        <p className="mb-2"><strong>Loading:</strong> {isLoading ? 'Sí' : 'No'}</p>
        {hookPermissions.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {hookPermissions.map((perm, idx) => (
              <li key={idx} className="text-sm">{perm}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay permisos en el hook</p>
        )}
      </div>

      {/* Roles Details */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Roles del Usuario</h2>
        {user?.roles && user.roles.length > 0 ? (
          <div className="space-y-4">
            {user.roles.map((role: any, idx: number) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold">{role.name}</p>
                <p className="text-sm text-gray-600">{role.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Permisos: {role.permissions?.length || 0}
                </p>
                {role.permissions && role.permissions.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-sm text-blue-600 cursor-pointer">
                      Ver permisos
                    </summary>
                    <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                      {role.permissions.map((perm: any, permIdx: number) => (
                        <li key={permIdx} className="text-xs text-gray-700">
                          {perm.module_key} - {perm.display_name}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay roles asignados</p>
        )}
      </div>

      {/* Check Specific Permission */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Verificar Permiso Específico</h2>
        <div className="space-y-2">
          <p className="text-sm">
            <strong>patients.view:</strong>{' '}
            <span className={hookPermissions.includes('patients.view') ? 'text-green-600' : 'text-red-600'}>
              {hookPermissions.includes('patients.view') ? '✅ Tiene permiso' : '❌ No tiene permiso'}
            </span>
          </p>
          <p className="text-sm">
            <strong>patients.create:</strong>{' '}
            <span className={hookPermissions.includes('patients.create') ? 'text-green-600' : 'text-red-600'}>
              {hookPermissions.includes('patients.create') ? '✅ Tiene permiso' : '❌ No tiene permiso'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
