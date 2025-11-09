/**
 * Specialty Service
 * Handles all API calls related to medical specialties
 */

import { apiRequest } from '../api';

export interface Specialty {
  id: number;
  name: string;
  description?: string;
  default_appointment_duration: number;
  default_color: string;
  icon?: string;
  is_active: boolean;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export const specialtyService = {
  /**
   * Get all specialties
   */
  getAll: async (params?: { active_only?: boolean }): Promise<{ success: boolean; data: Specialty[]; count: number }> => {
    const query = params?.active_only === false ? '?active_only=false' : '?active_only=true';
    return apiRequest(`/specialties${query}`, {
      method: 'GET',
    });
  },

  /**
   * Get a single specialty by ID
   */
  getById: async (id: number): Promise<{ success: boolean; data: Specialty }> => {
    return apiRequest(`/specialties/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Get a specialty by name
   */
  getByName: async (name: string): Promise<{ success: boolean; data: Specialty }> => {
    return apiRequest(`/specialties/name/${encodeURIComponent(name)}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new specialty
   */
  create: async (data: {
    name: string;
    description?: string;
    default_appointment_duration?: number;
    default_color?: string;
  }): Promise<{ success: boolean; message: string; data: Specialty }> => {
    return apiRequest('/specialties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a specialty
   */
  update: async (id: number, data: Partial<Specialty>): Promise<{ success: boolean; message: string; data: Specialty }> => {
    return apiRequest(`/specialties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Deactivate a specialty (soft delete)
   */
  deactivate: async (id: number): Promise<{ success: boolean; message: string; data: Specialty }> => {
    return apiRequest(`/specialties/${id}/deactivate`, {
      method: 'POST',
    });
  },

  /**
   * Activate a specialty
   */
  activate: async (id: number): Promise<{ success: boolean; message: string; data: Specialty }> => {
    return apiRequest(`/specialties/${id}/activate`, {
      method: 'POST',
    });
  },

  /**
   * Delete a specialty permanently
   */
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/specialties/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Initialize default specialties
   */
  initDefaults: async (): Promise<{ success: boolean; message: string; data: Specialty[] }> => {
    return apiRequest('/specialties/init-defaults', {
      method: 'POST',
    });
  },
};
