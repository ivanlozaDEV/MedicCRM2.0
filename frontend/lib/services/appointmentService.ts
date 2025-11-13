/**
 * Appointment Service
 * Handles all API calls related to appointments
 */

import { apiRequest } from '../api';

export type AppointmentStatus =
  | 'proposed'
  | 'pending'
  | 'booked'
  | 'arrived'
  | 'fulfilled'
  | 'cancelled'
  | 'noshow'
  | 'entered-in-error'
  | 'checked-in'
  | 'waitlist';

export interface Appointment {
  id: number;
  organization_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_type_id: number;
  specialty_id?: number;
  room_id?: number;
  slot_id?: number;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration_minutes: number;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  cancelled_by?: number;
  checked_in_at?: string;
  checked_out_at?: string;
  no_show_at?: string;
  is_past: boolean;
  can_check_in: boolean;
  can_cancel: boolean;
  created_at: string;
  updated_at?: string;
  // Relationships
  patient?: {
    id: number;
    full_name: string;
    email?: string;
    phone?: string;
    photo_url?: string;
  };
  doctor?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
  appointment_type?: {
    id: number;
    name: string;
    color?: string;
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

export interface CreateAppointmentData {
  organization_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_type_id: number;
  specialty_id?: number;
  room_id?: number;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  duration_minutes?: number;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  appointment_type_id?: number;
  specialty_id?: number;
  room_id?: number;
  appointment_date?: string;
  start_time?: string;
  duration_minutes?: number;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
}

export interface CancelAppointmentData {
  cancellation_reason: string;
}

/**
 * Get all appointments with optional filters
 */
export const getAppointments = async (params?: {
  organization_id?: number;
  patient_id?: number;
  doctor_id?: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  status?: AppointmentStatus;
}): Promise<Appointment[]> => {
  const queryParams = new URLSearchParams();
  
  if (params?.organization_id) {
    queryParams.append('organization_id', params.organization_id.toString());
  }
  if (params?.patient_id) {
    queryParams.append('patient_id', params.patient_id.toString());
  }
  if (params?.doctor_id) {
    queryParams.append('doctor_id', params.doctor_id.toString());
  }
  if (params?.start_date) {
    queryParams.append('start_date', params.start_date);
  }
  if (params?.end_date) {
    queryParams.append('end_date', params.end_date);
  }
  if (params?.status) {
    queryParams.append('status', params.status);
  }
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await apiRequest(
    `/api/appointments${query}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch appointments');
  }
  
  return response.data;
};

/**
 * Get today's appointments
 */
export const getTodayAppointments = async (
  organizationId: number,
  doctorId?: number
): Promise<Appointment[]> => {
  const params = new URLSearchParams();
  params.append('organization_id', organizationId.toString());
  if (doctorId) {
    params.append('doctor_id', doctorId.toString());
  }
  
  const response = await apiRequest(
    `/api/appointments/today?${params.toString()}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch today\'s appointments');
  }
  
  return response.data;
};

/**
 * Get appointments for a specific patient
 */
export const getPatientAppointments = async (patientId: number): Promise<Appointment[]> => {
  const response = await apiRequest(
    `/api/appointments/patient/${patientId}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch patient appointments');
  }
  
  return response.data;
};

/**
 * Get appointments for a specific doctor
 */
export const getDoctorAppointments = async (
  doctorId: number,
  startDate?: string,
  endDate?: string
): Promise<Appointment[]> => {
  const params = new URLSearchParams();
  if (startDate) {
    params.append('start_date', startDate);
  }
  if (endDate) {
    params.append('end_date', endDate);
  }
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiRequest(
    `/api/appointments/doctor/${doctorId}${query}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch doctor appointments');
  }
  
  return response.data;
};

/**
 * Get a single appointment by ID
 */
export const getAppointment = async (id: number): Promise<Appointment> => {
  const response = await apiRequest(
    `/api/appointments/${id}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch appointment');
  }
  
  return response.data;
};

/**
 * Create a new appointment
 */
export const createAppointment = async (data: CreateAppointmentData): Promise<Appointment> => {
  const response = await apiRequest(
    '/api/appointments',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to create appointment');
  }
  
  return response.data;
};

/**
 * Update an appointment
 */
export const updateAppointment = async (
  id: number,
  data: UpdateAppointmentData
): Promise<Appointment> => {
  const response = await apiRequest(
    `/api/appointments/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to update appointment');
  }
  
  return response.data;
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (
  id: number,
  data: CancelAppointmentData
): Promise<Appointment> => {
  const response = await apiRequest(
    `/api/appointments/${id}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to cancel appointment');
  }
  
  return response.data;
};

/**
 * Check-in a patient for an appointment
 */
export const checkInAppointment = async (id: number): Promise<Appointment> => {
  const response = await apiRequest(
    `/api/appointments/${id}/check-in`,
    { method: 'POST' }
  );
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to check-in appointment');
  }
  
  return response.data;
};

/**
 * Check-out a patient from an appointment
 */
export const checkOutAppointment = async (id: number): Promise<Appointment> => {
  const response = await apiRequest(
    `/api/appointments/${id}/check-out`,
    { method: 'POST' }
  );
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to check-out appointment');
  }
  
  return response.data;
};

/**
 * Mark an appointment as no-show
 */
export const markNoShowAppointment = async (id: number): Promise<Appointment> => {
  const response = await apiRequest(
    `/api/appointments/${id}/no-show`,
    { method: 'POST' }
  );
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to mark as no-show');
  }
  
  return response.data;
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (id: number): Promise<void> => {
  const response = await apiRequest(
    `/api/appointments/${id}`,
    { method: 'DELETE' }
  );
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete appointment');
  }
};

/**
 * Helper function to get status badge color
 */
export const getStatusColor = (status: AppointmentStatus): string => {
  const colors: Record<AppointmentStatus, string> = {
    proposed: 'gray',
    pending: 'yellow',
    booked: 'blue',
    arrived: 'purple',
    fulfilled: 'green',
    cancelled: 'red',
    noshow: 'orange',
    'entered-in-error': 'red',
    'checked-in': 'indigo',
    waitlist: 'gray',
  };
  return colors[status] || 'gray';
};

/**
 * Helper function to get status label in Spanish
 */
export const getStatusLabel = (status: AppointmentStatus): string => {
  const labels: Record<AppointmentStatus, string> = {
    proposed: 'Propuesta',
    pending: 'Pendiente',
    booked: 'Confirmada',
    arrived: 'Llegó',
    fulfilled: 'Completada',
    cancelled: 'Cancelada',
    noshow: 'No Asistió',
    'entered-in-error': 'Error',
    'checked-in': 'Check-in',
    waitlist: 'Lista de Espera',
  };
  return labels[status] || status;
};

/**
 * Helper function to format appointment time
 */
export const formatAppointmentTime = (appointment: Appointment): string => {
  return `${appointment.start_time} - ${appointment.end_time}`;
};

/**
 * Helper function to check if appointment is today
 */
export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
