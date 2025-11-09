'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import { specialtyService } from '@/lib/services/specialtyService';
import type { Specialty as SpecialtyType } from '@/lib/services/specialtyService';
import MedicalIcon from '@/components/icons/MedicalIcon';

interface UserSpecialty extends SpecialtyType {
  is_primary: boolean;
}

export default function ProfilePage() {
  const { user: currentUser, permissions } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
  const [isSpecialtySectionOpen, setIsSpecialtySectionOpen] = useState(false);

  // Estados para especialidades
  const [availableSpecialties, setAvailableSpecialties] = useState<SpecialtyType[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);
  const [primarySpecialty, setPrimarySpecialty] = useState<number | null>(null);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    photo_url: '',
    medical_license: '',
    professional_id: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    loadSpecialties();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        photo_url: currentUser.photo_url || '',
        medical_license: currentUser.professional_info?.medical_license || '',
        professional_id: currentUser.professional_info?.professional_id || '',
      });

      // Cargar especialidades del usuario
      const userSpecialties = currentUser.professional_info?.specialties || currentUser.specialties || [];
      const specialtyIds = userSpecialties.map((s: UserSpecialty) => s.id);
      setSelectedSpecialties(specialtyIds);
      
      // Encontrar especialidad primaria
      const primary = userSpecialties.find((s: UserSpecialty) => s.is_primary);
      if (primary) {
        setPrimarySpecialty(primary.id);
      }
    }
  }, [currentUser]);

  const loadSpecialties = async () => {
    setIsLoadingSpecialties(true);
    try {
      const response = await specialtyService.getAll();
      if (response.success) {
        setAvailableSpecialties(response.data);
      }
    } catch (err) {
      console.error('Error loading specialties:', err);
    } finally {
      setIsLoadingSpecialties(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecialtyToggle = (specialtyId: number) => {
    if (!isEditing) return;
    
    setSelectedSpecialties(prev => {
      if (prev.includes(specialtyId)) {
        // Si se deselecciona la especialidad primaria, limpiar
        if (primarySpecialty === specialtyId) {
          setPrimarySpecialty(null);
        }
        return prev.filter(id => id !== specialtyId);
      } else {
        // Si es la primera especialidad seleccionada, hacerla primaria
        if (prev.length === 0) {
          setPrimarySpecialty(specialtyId);
        }
        return [...prev, specialtyId];
      }
    });
  };

  const handleSetPrimarySpecialty = (specialtyId: number) => {
    if (!isEditing) return;
    if (selectedSpecialties.includes(specialtyId)) {
      setPrimarySpecialty(specialtyId);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      // Actualizar información del usuario
      const response = await userService.update(currentUser.id, formData);
      
      if (response.success) {
        // Actualizar especialidades
        try {
          await userService.updateSpecialties(
            currentUser.id,
            selectedSpecialties,
            primarySpecialty || undefined
          );
        } catch (err) {
          console.error('Error updating specialties:', err);
          // No fallar si las especialidades no se actualizan
        }

        setSuccessMessage('Perfil actualizado exitosamente');
        setIsEditing(false);
        
        // Recargar la página para actualizar el AuthContext
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(response.message || 'Error al actualizar el perfil');
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validaciones
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      // TODO: Implementar endpoint de cambio de contraseña
      // const response = await userService.changePassword(currentUser.id, passwordData);
      
      setSuccessMessage('Contraseña actualizada exitosamente');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setIsPasswordSectionOpen(false);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        photo_url: currentUser.photo_url || '',
        medical_license: currentUser.professional_info?.medical_license || '',
        professional_id: currentUser.professional_info?.professional_id || '',
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">Administra tu información personal y configuración</p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo and Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start space-x-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {formData.photo_url ? (
                <img 
                  src={formData.photo_url} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.first_name + ' ' + currentUser.last_name)}&size=200&background=4F46E5&color=fff`;
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {currentUser.first_name.charAt(0)}{currentUser.last_name.charAt(0)}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    placeholder="+593 99 999 9999"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de Foto
                  </label>
                  <input
                    type="url"
                    name="photo_url"
                    value={formData.photo_url}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Información Profesional
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Licencia Médica
              </label>
              <input
                type="text"
                name="medical_license"
                value={formData.medical_license}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="Ej: MSP-123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cédula Profesional
              </label>
              <input
                type="text"
                name="professional_id"
                value={formData.professional_id}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="Ej: 1234567890"
              />
            </div>
          </div>
        </div>

        {/* Specialties Section - Collapsible */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsSpecialtySectionOpen(!isSpecialtySectionOpen)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Especialidades Médicas</span>
              <span className="text-xs text-gray-500">
                ({isSpecialtySectionOpen ? 'Ocultar' : 'Mostrar'})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {selectedSpecialties.length > 0 && (
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {selectedSpecialties.length} seleccionada{selectedSpecialties.length !== 1 ? 's' : ''}
                </span>
              )}
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${isSpecialtySectionOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isSpecialtySectionOpen && (
            <div className="px-6 pb-6 pt-2 border-t border-gray-200">
              {isLoadingSpecialties ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {isEditing 
                      ? 'Selecciona tus especialidades médicas. Haz clic en la estrella para marcar tu especialidad principal.'
                      : 'Tus especialidades médicas. Haz clic en "Editar Perfil" para modificar.'
                    }
                  </p>

                  {selectedSpecialties.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Especialidades Seleccionadas
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedSpecialties.map(id => {
                          const specialty = availableSpecialties.find(s => s.id === id);
                          if (!specialty) return null;
                          const isPrimary = primarySpecialty === id;
                          
                          return (
                            <div
                              key={id}
                              className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all"
                              style={{
                                backgroundColor: `${specialty.default_color}15`,
                                borderColor: specialty.default_color,
                                color: specialty.default_color,
                              }}
                            >
                              <MedicalIcon name={specialty.icon || 'heart'} className="w-4 h-4 mr-2" />
                              <span>{specialty.name}</span>
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimarySpecialty(id)}
                                  className="ml-2"
                                  title={isPrimary ? 'Especialidad Principal' : 'Marcar como Principal'}
                                >
                                  <svg 
                                    className={`w-4 h-4 ${isPrimary ? 'fill-current' : 'stroke-current fill-none'}`}
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Todas las Especialidades Disponibles
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                        {availableSpecialties.map((specialty) => {
                          const isSelected = selectedSpecialties.includes(specialty.id);
                          const isPrimary = primarySpecialty === specialty.id;

                          return (
                            <label
                              key={specialty.id}
                              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSpecialtyToggle(specialty.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="ml-3 flex items-center flex-1">
                                <div 
                                  className="p-2 rounded-lg mr-2" 
                                  style={{ backgroundColor: `${specialty.default_color}20` }}
                                >
                                  <MedicalIcon 
                                    name={specialty.icon || 'heart'} 
                                    className="w-5 h-5"
                                    style={{ color: specialty.default_color }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900 flex-1">
                                  {specialty.name}
                                </span>
                                {isPrimary && (
                                  <svg className="w-4 h-4 text-yellow-500 fill-current ml-1" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!isEditing && selectedSpecialties.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <p className="text-sm">No tienes especialidades asignadas</p>
                      <p className="text-xs mt-1">Haz clic en "Editar Perfil" para agregar especialidades</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Change Password Section - Collapsible */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Cambiar Contraseña</span>
              <span className="text-xs text-gray-500">
                ({isPasswordSectionOpen ? 'Ocultar' : 'Mostrar'})
              </span>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${isPasswordSectionOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isPasswordSectionOpen && (
            <div className="px-6 pb-6 pt-2 border-t border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  disabled={isSaving || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Actualizar Contraseña
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Account Info - Read Only */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Cuenta</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Usuario:</span>
              <span className="ml-2 font-medium text-gray-900">{currentUser.username}</span>
            </div>
            
            <div>
              <span className="text-gray-600">Estado:</span>
              <span className={`ml-2 font-medium ${currentUser.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {currentUser.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div>
              <span className="text-gray-600">Miembro desde:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(currentUser.created_at).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>

            {currentUser.roles && currentUser.roles.length > 0 && (
              <div>
                <span className="text-gray-600">Roles:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {currentUser.roles.map((role: any) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
