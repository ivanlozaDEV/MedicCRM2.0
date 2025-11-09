'use client';

import { useState, useEffect } from 'react';
import { specialtyService } from '@/lib/services/specialtyService';
import type { Specialty } from '@/lib/services/specialtyService';
import MedicalIcon from '@/components/icons/MedicalIcon';

interface SpecialtyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  specialty?: Specialty | null;
  mode: 'create' | 'edit';
}

// Colores predefinidos para especialidades
const SPECIALTY_COLORS = [
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

// Iconos disponibles para especialidades médicas
const MEDICAL_ICONS = [
  { name: 'Corazón', value: 'heart' },
  { name: 'Pulso', value: 'heart-pulse' },
  { name: 'Doctor', value: 'user-doctor' },
  { name: 'Bebé', value: 'baby' },
  { name: 'Enfermera', value: 'user-nurse' },
  { name: 'Cirugía', value: 'scissors' },
  { name: 'Estética', value: 'hand-sparkles' },
  { name: 'Cerebro', value: 'brain' },
  { name: 'Embarazo', value: 'person-pregnant' },
  { name: 'Ojo', value: 'eye' },
  { name: 'Oído', value: 'ear-listen' },
  { name: 'Hueso', value: 'bone' },
  { name: 'Gota', value: 'droplet' },
  { name: 'Mano', value: 'hand' },
  { name: 'Laboratorio', value: 'flask' },
  { name: 'Estómago', value: 'stomach' },
  { name: 'Riñón', value: 'kidney' },
  { name: 'Pulmones', value: 'lungs' },
  { name: 'Lazo', value: 'ribbon' },
  { name: 'Mente', value: 'head-side-medical' },
  { name: 'Caminar', value: 'person-walking' },
  { name: 'Ejercicio', value: 'dumbbell' },
  { name: 'Diente', value: 'tooth' },
  { name: 'Dientes', value: 'teeth' },
  { name: 'Sonrisa', value: 'face-smile' },
  { name: 'Manzana', value: 'apple-whole' },
  { name: 'Correr', value: 'person-running' },
  { name: 'Ambulancia', value: 'truck-medical' },
  { name: 'Virus', value: 'virus' },
  { name: 'Estetoscopio', value: 'stethoscope' },
  { name: 'Bacteria', value: 'bacteria' },
  { name: 'Jeringa', value: 'syringe' },
  { name: 'Maletín', value: 'briefcase-medical' },
  { name: 'ADN', value: 'dna' },
];

export default function SpecialtyModal({
  isOpen,
  onClose,
  onSuccess,
  specialty,
  mode,
}: SpecialtyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_appointment_duration: 30,
    default_color: '#3B82F6',
    icon: 'heart',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos si es edición
  useEffect(() => {
    if (mode === 'edit' && specialty) {
      setFormData({
        name: specialty.name,
        description: specialty.description || '',
        default_appointment_duration: specialty.default_appointment_duration,
        default_color: specialty.default_color,
        icon: specialty.icon || 'heart',
      });
    } else {
      // Reset form para crear
      setFormData({
        name: '',
        description: '',
        default_appointment_duration: 30,
        default_color: '#3B82F6',
        icon: 'heart',
      });
    }
    setError('');
  }, [mode, specialty, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'default_appointment_duration' ? parseInt(value) || 0 : value,
    }));
  };

  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      default_color: color,
    }));
  };

  const handleIconSelect = (icon: string) => {
    setFormData((prev) => ({
      ...prev,
      icon: icon,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      let response;

      if (mode === 'create') {
        response = await specialtyService.create(formData);
      } else if (specialty) {
        response = await specialtyService.update(specialty.id, formData);
      }

      if (response?.success) {
        onSuccess();
        onClose();
      } else {
        setError(response?.message || 'Error al guardar la especialidad');
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar la especialidad');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Nueva Especialidad' : 'Editar Especialidad'}
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
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Especialidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Cardiología, Pediatría"
                />
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción de la especialidad"
                />
              </div>

              {/* Duración */}
              <div>
                <label
                  htmlFor="default_appointment_duration"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Duración de Cita (min)
                </label>
                <input
                  type="number"
                  id="default_appointment_duration"
                  name="default_appointment_duration"
                  value={formData.default_appointment_duration}
                  onChange={handleChange}
                  min={5}
                  max={240}
                  step={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Entre 5 y 240 minutos</p>
              </div>

              {/* Selector de Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {SPECIALTY_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleColorSelect(color.value)}
                      className={`
                        h-10 rounded-lg border-2 transition-all
                        ${formData.default_color === color.value 
                          ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' 
                          : 'border-gray-200 hover:border-gray-400'
                        }
                      `}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Selector de Icono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icono
                </label>
                <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {MEDICAL_ICONS.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => handleIconSelect(icon.value)}
                      className={`
                        h-10 w-10 rounded-lg border-2 transition-all flex items-center justify-center
                        ${formData.icon === icon.value 
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-offset-1' 
                          : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                        }
                      `}
                      title={icon.name}
                    >
                      <MedicalIcon 
                        name={icon.value} 
                        className="w-5 h-5"
                        style={{ 
                          color: formData.icon === icon.value ? '#2563EB' : '#6B7280' 
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa</p>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${formData.default_color}15` }}
                  >
                    <MedicalIcon
                      name={formData.icon}
                      className="w-6 h-6"
                      style={{ color: formData.default_color }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {formData.name || 'Nombre de la especialidad'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formData.description || 'Sin descripción'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.default_appointment_duration} minutos por cita
                    </p>
                  </div>
                </div>
              </div>          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Especialidad' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}