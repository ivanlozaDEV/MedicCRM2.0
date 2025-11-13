/**
 * Doctor Schedule Service
 * Handles all API calls related to doctor schedules
 */

import { apiRequest } from '../api';

export interface DoctorSchedule {
  id: number;
  organization_id: number;
  doctor_id: number;
  specialty_id?: number;
  room_id?: number;
  day_of_week: number; // 0 = Monday, 6 = Sunday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  break_start_time?: string;
  break_end_time?: string;
  slot_duration_minutes: number;
  effective_from?: string; // YYYY-MM-DD
  effective_until?: string; // YYYY-MM-DD
  is_active: boolean;
  total_hours?: number;
  available_slots?: number;
  day_name?: string;
  created_at: string;
  updated_at?: string;
  // Relationships
  doctor?: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  specialty?: {
    id: number;
    name: string;
  };
  room?: {
    id: number;
    name: string;
    location?: string;
  };
}

export interface CreateDoctorScheduleData {
  organization_id: number;
  doctor_id: number;
  specialty_id?: number;
  room_id?: number;
  day_of_week: number;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  break_start_time?: string;
  break_end_time?: string;
  slot_duration_minutes: number;
  effective_from?: string; // YYYY-MM-DD
  effective_until?: string; // YYYY-MM-DD
}

export interface UpdateDoctorScheduleData {
  specialty_id?: number;
  room_id?: number;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  break_start_time?: string | null;
  break_end_time?: string | null;
  slot_duration_minutes?: number;
  effective_from?: string;
  effective_until?: string;
  is_active?: boolean;
}

/**
 * Get all doctor schedules with optional filters
 */
export const getDoctorSchedules = async (params?: {
  organization_id?: number;
  doctor_id?: number;
  specialty_id?: number;
  day_of_week?: number;
  is_active?: boolean;
}): Promise<DoctorSchedule[]> => {
  const queryParams = new URLSearchParams();
  
  if (params?.organization_id) {
    queryParams.append('organization_id', params.organization_id.toString());
  }
  if (params?.doctor_id) {
    queryParams.append('doctor_id', params.doctor_id.toString());
  }
  if (params?.specialty_id) {
    queryParams.append('specialty_id', params.specialty_id.toString());
  }
  if (params?.day_of_week !== undefined) {
    queryParams.append('day_of_week', params.day_of_week.toString());
  }
  if (params?.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString());
  }
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await apiRequest(
    `/api/doctor-schedules${query}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch doctor schedules');
  }
  
  return response.data;
};

/**
 * Get schedules for a specific doctor
 */
export const getDoctorSchedulesByDoctor = async (doctorId: number): Promise<DoctorSchedule[]> => {
  const response = await apiRequest(
    `/api/doctor-schedules/doctor/${doctorId}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch doctor schedules');
  }
  
  return response.data;
};

/**
 * Get a single doctor schedule by ID
 */
export const getDoctorSchedule = async (id: number): Promise<DoctorSchedule> => {
  const response = await apiRequest(
    `/api/doctor-schedules/${id}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch doctor schedule');
  }
  
  return response.data;
};

/**
 * Create a new doctor schedule
 */
export const createDoctorSchedule = async (
  data: CreateDoctorScheduleData
): Promise<DoctorSchedule> => {
  const response = await apiRequest(
    '/api/doctor-schedules',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  
  if (!response.success) {
    throw new Error('Failed to create doctor schedule');
  }
  
  return response.data;
};

/**
 * Update a doctor schedule
 */
export const updateDoctorSchedule = async (
  id: number,
  data: UpdateDoctorScheduleData
): Promise<DoctorSchedule> => {
  const response = await apiRequest(
    `/api/doctor-schedules/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  
  if (!response.success) {
    throw new Error('Failed to update doctor schedule');
  }
  
  return response.data;
};

/**
 * Delete a doctor schedule
 */
export const deleteDoctorSchedule = async (id: number): Promise<void> => {
  const response = await apiRequest(
    `/api/doctor-schedules/${id}`,
    { method: 'DELETE' }
  );
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete doctor schedule');
  }
};

/**
 * Helper function to get day name from day_of_week number
 */
export const getDayName = (dayOfWeek: number): string => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return days[dayOfWeek] || 'Unknown';
};

/**
 * Helper function to format time range
 */
export const formatTimeRange = (schedule: DoctorSchedule): string => {
  if (schedule.break_start_time && schedule.break_end_time) {
    return `${schedule.start_time} - ${schedule.break_start_time} / ${schedule.break_end_time} - ${schedule.end_time}`;
  }
  return `${schedule.start_time} - ${schedule.end_time}`;
};
