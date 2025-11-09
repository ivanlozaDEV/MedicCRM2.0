'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import { roleService } from '@/lib/services/roleService';
import type { User } from '@/lib/services/userService';
import type { Role } from '@/lib/services/roleService';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
  mode: 'create' | 'edit';
}

export default function UserModal({ isOpen, onClose, onSuccess, user, mode }: UserModalProps) {
  const { organization } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    is_active: true,
  });

  // Cargar datos del usuario si estamos editando
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        password: '', // No mostramos la contraseña actual
        is_active: user.is_active ?? true,
      });
      
      // Cargar roles del usuario
      if (user.roles && user.roles.length > 0) {
        setSelectedRoleIds(user.roles.map((r: any) => r.id));
      } else {
        setSelectedRoleIds([]);
      }
    } else if (mode === 'create') {
      // Reset form para modo crear
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        is_active: true,
      });
      setSelectedRoleIds([]);
    }
    setError('');
  }, [mode, user, isOpen]);

  // Cargar roles disponibles de la organización
  useEffect(() => {
    const loadRoles = async () => {
      if (!organization) return;
      
      try {
        const response = await roleService.getAll(organization.id);
        if (response.success) {
          setAvailableRoles(response.data);
        }
      } catch (error) {
        console.error('Error loading roles:', error);
      }
    };

    if (isOpen && organization) {
      loadRoles();
    }
  }, [isOpen, organization]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!organization) {
      setError('No se encontró la organización');
      return;
    }

    // Validaciones
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (mode === 'create' && !formData.password) {
      setError('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    if (mode === 'create' && formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        organization_id: organization.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        username: formData.username || formData.email.split('@')[0],
        is_active: formData.is_active,
        role_ids: selectedRoleIds, // Incluir los roles seleccionados
      };

      // Solo incluir password si estamos creando o si se proporcionó una nueva
      if (mode === 'create' || formData.password) {
        payload.password = formData.password;
      }

      let response;
      if (mode === 'create') {
        response = await userService.create(payload);
      } else if (user) {
        response = await userService.update(user.id, payload);
      }

      if (response?.success) {
        onSuccess();
        onClose();
      } else {
        setError(response?.message || 'Error al guardar el usuario');
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Información Personal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Información Personal</h3>
            
            {mode === 'create' && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> El usuario podrá completar su perfil (teléfono, información profesional, especialidades, etc.) después de iniciar sesión.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Se generará del email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === 'create' ? 'Contraseña *' : 'Nueva Contraseña (dejar vacío para no cambiar)'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={mode === 'create'}
                  placeholder={mode === 'edit' ? 'Dejar vacío para no cambiar' : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {mode === 'create' && (
                  <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                )}
              </div>
            </div>
          </div>

          {/* Roles */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Roles y Permisos</h3>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona uno o más roles para este usuario. Los roles determinan los permisos y accesos del usuario.
            </p>
            
            {availableRoles.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No hay roles disponibles en esta organización. Por favor, crea roles primero.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableRoles.map((role) => (
                  <label
                    key={role.id}
                    className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRoleIds.includes(role.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">{role.name}</span>
                      </div>
                      {role.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Usuario Activo</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Los usuarios inactivos no podrán iniciar sesión
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
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
                <span>{mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
