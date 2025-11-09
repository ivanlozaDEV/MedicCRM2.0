'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { organizationService } from '@/lib/services/organizationService';
import type { Organization } from '@/lib/services/organizationService';
import { colorPalettes, type ColorPalette } from '@/lib/colorPalettes';

export default function OrganizationPage() {
  const { organization: currentOrg, permissions } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);
  const [isColorSectionOpen, setIsColorSectionOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    tax_id: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Ecuador',
    timezone: 'America/Guayaquil',
    currency: 'USD',
    primary_color: '#4F46E5',
    secondary_color: '#10B981',
    accent_color: '#F59E0B',
    success_color: '#10B981',
    warning_color: '#F59E0B',
    error_color: '#EF4444',
    info_color: '#3B82F6',
    logo_url: '',
  });

  const canEdit = permissions.includes('organizations.update');

  useEffect(() => {
    loadOrganization();
  }, [currentOrg]);

  const loadOrganization = async () => {
    if (!currentOrg) return;

    try {
      setIsLoading(true);
      const response = await organizationService.getById(currentOrg.id);
      
      if (response.success) {
        setOrganization(response.data);
        setFormData({
          name: response.data.name || '',
          legal_name: response.data.legal_name || '',
          tax_id: response.data.tax_id || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          website: response.data.website || '',
          address_line1: response.data.address_line1 || '',
          address_line2: response.data.address_line2 || '',
          city: response.data.city || '',
          state: response.data.state || '',
          postal_code: response.data.postal_code || '',
          country: response.data.country || 'Ecuador',
          timezone: response.data.timezone || 'America/Guayaquil',
          currency: response.data.currency || 'USD',
          primary_color: response.data.primary_color || '#4F46E5',
          secondary_color: response.data.secondary_color || '#10B981',
          accent_color: response.data.accent_color || '#F59E0B',
          success_color: response.data.success_color || '#10B981',
          warning_color: response.data.warning_color || '#F59E0B',
          error_color: response.data.error_color || '#EF4444',
          info_color: response.data.info_color || '#3B82F6',
          logo_url: response.data.logo_url || '',
        });
      }
    } catch (err) {
      console.error('Error loading organization:', err);
      setError('Error al cargar la organización');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyPalette = (palette: ColorPalette) => {
    setSelectedPalette(palette);
    setFormData(prev => ({
      ...prev,
      primary_color: palette.primary_color,
      secondary_color: palette.secondary_color,
      accent_color: palette.accent_color,
      success_color: palette.success_color,
      warning_color: palette.warning_color,
      error_color: palette.error_color,
      info_color: palette.info_color,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;

    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const response = await organizationService.update(currentOrg.id, formData);
      
      if (response.success) {
        setSuccessMessage('Organización actualizada exitosamente');
        setIsEditing(false);
        await loadOrganization();
        
        // Recargar la página completa para actualizar el AuthContext y el dashboard
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(response.message || 'Error al actualizar la organización');
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la organización');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
    loadOrganization();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Organización</h1>
          <p className="text-gray-600 mt-1">Gestiona la información de tu organización</p>
        </div>
        {!isEditing && canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar Información</span>
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Información Básica
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Comercial <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón Social
              </label>
              <input
                type="text"
                name="legal_name"
                value={formData.legal_name}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RUC / NIT
              </label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              {/* Header Collapsible para Paleta de Colores */}
              <button
                type="button"
                onClick={() => setIsColorSectionOpen(!isColorSectionOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Paleta de Colores</span>
                  <span className="text-xs text-gray-500">
                    ({isColorSectionOpen ? 'Ocultar' : 'Mostrar'})
                  </span>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${isColorSectionOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Contenido Collapsible */}
              {isColorSectionOpen && (
                <div className="mt-2 space-y-4">
              
              {/* Paletas Predefinidas */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Paletas Predefinidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {colorPalettes.map((palette) => (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() => applyPalette(palette)}
                      disabled={!isEditing}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedPalette?.name === palette.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900">{palette.name}</span>
                        {selectedPalette?.name === palette.name && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{palette.description}</p>
                      <div className="flex space-x-1">
                        <div 
                          className="w-8 h-6 rounded border border-gray-300" 
                          style={{ backgroundColor: palette.primary_color }}
                          title="Principal"
                        />
                        <div 
                          className="w-8 h-6 rounded border border-gray-300" 
                          style={{ backgroundColor: palette.secondary_color }}
                          title="Secundario"
                        />
                        <div 
                          className="w-8 h-6 rounded border border-gray-300" 
                          style={{ backgroundColor: palette.accent_color }}
                          title="Acento"
                        />
                        <div 
                          className="w-6 h-6 rounded border border-gray-300" 
                          style={{ backgroundColor: palette.success_color }}
                          title="Éxito"
                        />
                        <div 
                          className="w-6 h-6 rounded border border-gray-300" 
                          style={{ backgroundColor: palette.warning_color }}
                          title="Advertencia"
                        />
                        <div 
                          className="w-6 h-6 rounded border border-gray-300" 
                          style={{ backgroundColor: palette.error_color }}
                          title="Error"
                        />
                        <div 
                          className="w-6 h-6 rounded border border-gray-300" 
                          style={{ backgroundColor: palette.info_color }}
                          title="Info"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Pickers Individuales */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Personalización Manual</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Primary Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Principal
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="primary_color"
                      value={formData.primary_color}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-10 w-12 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={handleChange}
                      name="primary_color"
                      disabled={!isEditing}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Secundario
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="secondary_color"
                      value={formData.secondary_color}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-10 w-12 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={handleChange}
                      name="secondary_color"
                      disabled={!isEditing}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Acento
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="accent_color"
                      value={formData.accent_color}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-10 w-12 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={formData.accent_color}
                      onChange={handleChange}
                      name="accent_color"
                      disabled={!isEditing}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    />
                  </div>
                </div>

                {/* Success Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Éxito
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="success_color"
                      value={formData.success_color}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-10 w-12 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={formData.success_color}
                      onChange={handleChange}
                      name="success_color"
                      disabled={!isEditing}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    />
                  </div>
                </div>

                {/* Warning Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Advertencia
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="warning_color"
                      value={formData.warning_color}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-10 w-12 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={formData.warning_color}
                      onChange={handleChange}
                      name="warning_color"
                      disabled={!isEditing}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    />
                  </div>
                </div>

                {/* Error Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Error
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="error_color"
                      value={formData.error_color}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-10 w-12 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={formData.error_color}
                      onChange={handleChange}
                      name="error_color"
                      disabled={!isEditing}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    />
                  </div>
                </div>

                {/* Info Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Información
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="info_color"
                      value={formData.info_color}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-10 w-12 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={formData.info_color}
                      onChange={handleChange}
                      name="info_color"
                      disabled={!isEditing}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selecciona una paleta predefinida o personaliza cada color manualmente.
              </p>
              </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="https://ejemplo.com/logo.png"
              />
              {formData.logo_url && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                  <img 
                    src={formData.logo_url} 
                    alt="Logo preview" 
                    className="h-16 w-auto object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent && !parent.querySelector('.error-message')) {
                        const errorMsg = document.createElement('p');
                        errorMsg.className = 'error-message text-sm text-red-600';
                        errorMsg.textContent = 'Error al cargar la imagen. Verifica la URL.';
                        parent.appendChild(errorMsg);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Información de Contacto
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="contacto@organizacion.com"
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
                Sitio Web
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="https://www.organizacion.com"
              />
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Dirección
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección Línea 1
              </label>
              <input
                type="text"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="Calle principal 123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección Línea 2
              </label>
              <input
                type="text"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="Edificio, piso, departamento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                  placeholder="Quito"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provincia / Estado
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                  placeholder="Pichincha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                  placeholder="170150"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
              >
                <option value="Ecuador">Ecuador</option>
                <option value="Colombia">Colombia</option>
                <option value="Perú">Perú</option>
                <option value="Chile">Chile</option>
                <option value="Argentina">Argentina</option>
                <option value="México">México</option>
                <option value="España">España</option>
                <option value="Estados Unidos">Estados Unidos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuración Regional */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Configuración Regional
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zona Horaria
              </label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
              >
                <option value="America/Guayaquil">América/Guayaquil (UTC-5)</option>
                <option value="America/Bogota">América/Bogotá (UTC-5)</option>
                <option value="America/Lima">América/Lima (UTC-5)</option>
                <option value="America/Santiago">América/Santiago (UTC-3)</option>
                <option value="America/Argentina/Buenos_Aires">América/Buenos Aires (UTC-3)</option>
                <option value="America/Mexico_City">América/Ciudad de México (UTC-6)</option>
                <option value="Europe/Madrid">Europa/Madrid (UTC+1)</option>
                <option value="America/New_York">América/Nueva York (UTC-5)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
              >
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="COP">COP - Peso Colombiano</option>
                <option value="PEN">PEN - Sol Peruano</option>
                <option value="CLP">CLP - Peso Chileno</option>
                <option value="ARS">ARS - Peso Argentino</option>
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-4 bg-gray-50 px-6 py-4 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Información adicional */}
      {organization && !isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">Información de la Organización</h3>
              <div className="text-sm text-blue-800 mt-2 space-y-1">
                <p><strong>Creada:</strong> {new Date(organization.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Última actualización:</strong> {new Date(organization.updated_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Estado:</strong> <span className={organization.is_active ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>{organization.is_active ? 'Activa' : 'Inactiva'}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
