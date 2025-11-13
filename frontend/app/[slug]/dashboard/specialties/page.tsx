"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { specialtyService, Specialty } from "@/lib/services/specialtyService";
import SpecialtyModal from "@/components/dashboard/SpecialtyModal";
import MedicalIcon from "@/components/icons/MedicalIcon";


export default function SpecialtiesPage() {
  const { permissions } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canCreate = permissions.includes("specialties.create");
  const canEdit = permissions.includes("specialties.update");

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    setIsLoading(true);
    try {
      const response = await specialtyService.getAll();
      if (response.success) {
        setSpecialties(response.data);
      }
    } catch (e) {
      console.error("Error al cargar especialidades:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpecialty = () => {
    setModalMode('create');
    setSelectedSpecialty(null);
    setShowModal(true);
  };

  const handleEditSpecialty = (specialty: Specialty) => {
    setModalMode('edit');
    setSelectedSpecialty(specialty);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    loadSpecialties();
  };

  // Filtrar especialidades por búsqueda
  const filteredSpecialties = specialties.filter(spec =>
    spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (spec.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Especialidades Médicas</h1>
          <p className="text-gray-600 mt-1">Gestiona las especialidades disponibles en tu organización.</p>
        </div>
        {canCreate && (
          <button
            onClick={handleCreateSpecialty}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Agregar Especialidad</span>
          </button>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Acerca de las Especialidades</h3>
            <p className="text-sm text-blue-800 mt-1">
              Las especialidades permiten categorizar y asignar áreas médicas a los profesionales. Puedes crear nuevas especialidades según las necesidades de tu organización.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar especialidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Especialidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredSpecialties.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No se encontraron especialidades</p>
              {canCreate && (
                <button
                  onClick={handleCreateSpecialty}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Agregar la primera especialidad
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredSpecialties.map((spec) => (
            <div
              key={spec.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${spec.default_color}15` }}
                  >
                    <MedicalIcon
                      name={spec.icon || 'heart'}
                      className="w-6 h-6"
                      style={{ color: spec.default_color }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{spec.name}</h3>
                  </div>
                </div>

                {/* Actions */}
                {canEdit && (
                  <button
                    onClick={() => handleEditSpecialty(spec)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar especialidad"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              {/* Descripción */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {spec.description || 'Sin descripción'}
              </p>
              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>{spec.default_appointment_duration} min por cita</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{spec.user_count || 0} {spec.user_count === 1 ? 'usuario' : 'usuarios'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Specialty Modal */}
      <SpecialtyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        specialty={selectedSpecialty}
        mode={modalMode}
      />
    </div>
  );
}
