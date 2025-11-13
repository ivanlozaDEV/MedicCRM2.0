/**
 * Appointment Type Service
 * Handles all API calls related to appointment types
 */

import { apiRequest } from '../api';

export interface AppointmentType {
  id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateAppointmentTypeData {
  name: string;
  description?: string;
  duration_minutes: number;
  color?: string;
}

export interface UpdateAppointmentTypeData {
  name?: string;
  description?: string;
  duration_minutes?: number;
  color?: string;
  is_active?: boolean;
}

/**
 * Get all appointment types
 */
export const getAppointmentTypes = async (includeInactive = false): Promise<AppointmentType[]> => {
  const params = new URLSearchParams();
  if (includeInactive) {
    params.append('include_inactive', 'true');
  }
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiRequest(
    `/api/appointment-types${query}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch appointment types');
  }
  
  return response.data;
};

/**
 * Get a single appointment type by ID
 */
export const getAppointmentType = async (id: number): Promise<AppointmentType> => {
  const response = await apiRequest(
    `/api/appointment-types/${id}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch appointment type');
  }
  
  return response.data;
};

/**
 * Create a new appointment type
 */
export const createAppointmentType = async (data: CreateAppointmentTypeData): Promise<AppointmentType> => {
  const response = await apiRequest(
    '/api/appointment-types',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  
  if (!response.success) {
    throw new Error('Failed to create appointment type');
  }
  
  return response.data;
};

/**
 * Update an appointment type
 */
export const updateAppointmentType = async (
  id: number,
  data: UpdateAppointmentTypeData
): Promise<AppointmentType> => {
  const response = await apiRequest(
    `/api/appointment-types/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  
  if (!response.success) {
    throw new Error('Failed to update appointment type');
  }
  
  return response.data;
};

/**
 * Delete an appointment type
 */
export const deleteAppointmentType = async (id: number): Promise<void> => {
  const response = await apiRequest(
    `/api/appointment-types/${id}`,
    { method: 'DELETE' }
  );
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete appointment type');
  }
};
