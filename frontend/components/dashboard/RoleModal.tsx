'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { roleService } from '@/lib/services/roleService';
import { permissionService } from '@/lib/services/permissionService';
import type { Role } from '@/lib/services/roleService';
import type { Permission, PermissionsGrouped } from '@/lib/services/permissionService';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: Role | null;
  mode: 'create' | 'edit';
}

// Colores predefinidos para roles
const ROLE_COLORS = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Amarillo', value: '#F59E0B' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Morado', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Gris', value: '#6B7280' },
  { name: 'Lima', value: '#84CC16' },
  { name: 'Naranja', value: '#F97316' },
  { name: 'Teal', value: '#14B8A6' },
];

export default function RoleModal({ isOpen, onClose, onSuccess, role, mode }: RoleModalProps) {
  const { organization } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    is_system: false,
  });

  // Estados para permisos
  const [permissionsGrouped, setPermissionsGrouped] = useState<PermissionsGrouped | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  // Cargar permisos disponibles
  useEffect(() => {
    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen]);

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const response = await permissionService.getAll({ grouped: true });
      if (response.success && response.data) {
        setPermissionsGrouped(response.data as PermissionsGrouped);
      }
    } catch (err) {
      console.error('Error loading permissions:', err);
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Cargar permisos del rol si estamos editando
  useEffect(() => {
    if (mode === 'edit' && role && isOpen) {
      loadRolePermissions();
    }
  }, [mode, role, isOpen]);

  const loadRolePermissions = async () => {
    if (!role) return;
    
    try {
      const response = await roleService.getPermissions(role.id);
      if (response.success && response.data.permissions) {
        const permissionIds = response.data.permissions.map((p: Permission) => p.id);
        setSelectedPermissions(permissionIds);
      }
    } catch (err) {
      console.error('Error loading role permissions:', err);
    }
  };

  // Cargar datos del rol si estamos editando
  useEffect(() => {
    if (mode === 'edit' && role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        color: role.color || '#3B82F6',
        is_system: role.is_system ?? false,
      });
    } else if (mode === 'create') {
      // Reset form para modo crear
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        is_system: false,
      });
      setSelectedPermissions([]);
    }
    setError('');
  }, [mode, role, isOpen]);

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const toggleCategoryPermissions = (category: 'system' | 'clinical' | 'administrative') => {
    if (!permissionsGrouped) return;
    
    const categoryPermissions = permissionsGrouped[category];
    const categoryPermissionIds = categoryPermissions.map(p => p.id);
    const allSelected = categoryPermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Deselect all from this category
      setSelectedPermissions(prev => prev.filter(id => !categoryPermissionIds.includes(id)));
    } else {
      // Select all from this category
      setSelectedPermissions(prev => {
        const newIds = categoryPermissionIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!organization) {
      setError('No se encontró la organización');
      return;
    }

    // Validaciones
    if (!formData.name) {
      setError('El nombre del rol es obligatorio');
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        organization_id: organization.id,
        name: formData.name,
        description: formData.description,
        color: formData.color,
        is_system: false, // Los roles creados manualmente nunca son del sistema
      };

      let response;
      let savedRoleId: number | undefined;

      if (mode === 'create') {
        response = await roleService.create(payload);
        savedRoleId = response?.data?.id;
      } else if (role) {
        // No permitir cambiar el nombre de roles del sistema
        if (role.is_system) {
          payload.name = role.name; // Mantener el nombre original
        }
        response = await roleService.update(role.id, payload);
        savedRoleId = role.id;
      }

      if (response?.success && savedRoleId) {
        // Guardar permisos
        try {
          await roleService.updatePermissions(savedRoleId, selectedPermissions);
        } catch (permErr) {
          console.error('Error saving permissions:', permErr);
          // No bloqueamos el éxito del rol por error en permisos
        }

        onSuccess();
        onClose();
      } else {
        setError(response?.message || 'Error al guardar el rol');
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar el rol');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Nuevo Rol' : 'Editar Rol'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Warning for system roles */}
          {role?.is_system && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Este es un rol del sistema. Solo puedes editar su descripción y color.
              </p>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Rol *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={role?.is_system}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Ej: Doctor, Enfermera, Recepcionista"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe las responsabilidades de este rol..."
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color del Rol
            </label>
            <div className="grid grid-cols-6 gap-2">
              {ROLE_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => handleColorSelect(colorOption.value)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.color === colorOption.value
                      ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.name}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              El color se usa para identificar visualmente el rol en la interfaz
            </p>
          </div>

          {/* Permisos */}
          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Permisos del Rol
              </label>
              <button
                type="button"
                onClick={() => setShowPermissions(!showPermissions)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showPermissions ? 'Ocultar' : 'Mostrar'} ({selectedPermissions.length} seleccionados)
              </button>
            </div>

            {showPermissions && (
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
                {loadingPermissions ? (
                  <div className="text-center py-4 text-gray-500">
                    Cargando permisos...
                  </div>
                ) : permissionsGrouped ? (
                  <>
                    {/* System Permissions */}
                    {permissionsGrouped.system && permissionsGrouped.system.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">🔧 Sistema</h4>
                          <button
                            type="button"
                            onClick={() => toggleCategoryPermissions('system')}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            {permissionsGrouped.system.every(p => selectedPermissions.includes(p.id))
                              ? 'Deseleccionar todos'
                              : 'Seleccionar todos'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {permissionsGrouped.system.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-start space-x-2 text-sm cursor-pointer hover:bg-white rounded p-2 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{permission.display_name}</div>
                                {permission.description && (
                                  <div className="text-xs text-gray-500">{permission.description}</div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clinical Permissions */}
                    {permissionsGrouped.clinical && permissionsGrouped.clinical.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">⚕️ Clínico</h4>
                          <button
                            type="button"
                            onClick={() => toggleCategoryPermissions('clinical')}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            {permissionsGrouped.clinical.every(p => selectedPermissions.includes(p.id))
                              ? 'Deseleccionar todos'
                              : 'Seleccionar todos'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {permissionsGrouped.clinical.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-start space-x-2 text-sm cursor-pointer hover:bg-white rounded p-2 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{permission.display_name}</div>
                                {permission.description && (
                                  <div className="text-xs text-gray-500">{permission.description}</div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Administrative Permissions */}
                    {permissionsGrouped.administrative && permissionsGrouped.administrative.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">📊 Administrativo</h4>
                          <button
                            type="button"
                            onClick={() => toggleCategoryPermissions('administrative')}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            {permissionsGrouped.administrative.every(p => selectedPermissions.includes(p.id))
                              ? 'Deseleccionar todos'
                              : 'Seleccionar todos'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {permissionsGrouped.administrative.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-start space-x-2 text-sm cursor-pointer hover:bg-white rounded p-2 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{permission.display_name}</div>
                                {permission.description && (
                                  <div className="text-xs text-gray-500">{permission.description}</div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No se pudieron cargar los permisos
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vista Previa
            </label>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${formData.color}15` }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: formData.color }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {formData.name || 'Nombre del rol'}
                </h3>
                <p className="text-xs text-gray-600">
                  {formData.description || 'Descripción del rol'}
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{mode === 'create' ? 'Crear Rol' : 'Guardar Cambios'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
