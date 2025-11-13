/**
 * Appointment Slot Service
 * Handles all API calls related to appointment slots
 */

import { apiRequest } from '../api';

export type SlotStatus = 'free' | 'busy' | 'busy-unavailable' | 'busy-tentative';

export interface AppointmentSlot {
  id: number;
  organization_id: number;
  doctor_id: number;
  schedule_id: number;
  specialty_id?: number;
  slot_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration_minutes: number;
  status: SlotStatus;
  appointment_id?: number;
  is_blocked: boolean;
  block_reason?: string;
  blocked_by?: number;
  blocked_at?: string;
  created_at: string;
  updated_at?: string;
  // Relationships
  doctor?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
  specialty?: {
    id: number;
    name: string;
  };
  appointment?: {
    id: number;
    patient_id: number;
    status: string;
    reason?: string;
  };
}

export interface GetAvailableSlotsParams {
  doctor_id: number;
  start_date: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  organization_id?: number;
}

export interface GetSlotsByDateParams {
  organization_id: number;
  slot_date: string; // YYYY-MM-DD
  doctor_id?: number;
  specialty_id?: number;
}

export interface GenerateSlotsData {
  schedule_id: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}

export interface BlockSlotData {
  reason: string;
  blocked_by_user_id?: number;
}

export interface BlockSlotRangeData {
  doctor_id: number;
  start_date: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  reason: string;
  blocked_by_user_id?: number;
}

/**
 * Get available appointment slots
 */
export const getAvailableSlots = async (params: GetAvailableSlotsParams): Promise<AppointmentSlot[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('doctor_id', params.doctor_id.toString());
  queryParams.append('start_date', params.start_date);
  
  if (params.end_date) {
    queryParams.append('end_date', params.end_date);
  }
  if (params.organization_id) {
    queryParams.append('organization_id', params.organization_id.toString());
  }
  
  const response = await apiRequest(
    `/api/appointment-slots/available?${queryParams.toString()}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch available slots');
  }
  
  return response.data;
};

/**
 * Get slots by date
 */
export const getSlotsByDate = async (params: GetSlotsByDateParams): Promise<AppointmentSlot[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('organization_id', params.organization_id.toString());
  queryParams.append('slot_date', params.slot_date);
  
  if (params.doctor_id) {
    queryParams.append('doctor_id', params.doctor_id.toString());
  }
  if (params.specialty_id) {
    queryParams.append('specialty_id', params.specialty_id.toString());
  }
  
  const response = await apiRequest(
    `/api/appointment-slots/by-date?${queryParams.toString()}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch slots by date');
  }
  
  return response.data;
};

/**
 * Get a single slot by ID
 */
export const getSlot = async (id: number): Promise<AppointmentSlot> => {
  const response = await apiRequest(
    `/api/appointment-slots/${id}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch slot');
  }
  
  return response.data;
};

/**
 * Generate slots for a schedule
 */
export const generateSlots = async (data: GenerateSlotsData): Promise<{ count: number }> => {
  const response = await apiRequest(
    '/api/appointment-slots/generate',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  
  if (!response.success) {
    throw new Error('Failed to generate slots');
  }
  
  return { count: response.count };
};

/**
 * Block a slot
 */
export const blockSlot = async (id: number, data: BlockSlotData): Promise<AppointmentSlot> => {
  const response = await apiRequest(
    `/api/appointment-slots/${id}/block`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to block slot');
  }
  
  return response.data;
};

/**
 * Unblock a slot
 */
export const unblockSlot = async (id: number): Promise<AppointmentSlot> => {
  const response = await apiRequest(
    `/api/appointment-slots/${id}/unblock`,
    { method: 'POST' }
  );
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to unblock slot');
  }
  
  return response.data;
};

/**
 * Block a range of slots
 */
export const blockSlotRange = async (data: BlockSlotRangeData): Promise<{ count: number }> => {
  const response = await apiRequest(
    '/api/appointment-slots/block-range',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  
  if (!response.success) {
    throw new Error('Failed to block slot range');
  }
  
  return { count: response.count };
};

/**
 * Clean up old slots
 */
export const cleanupOldSlots = async (daysToKeep = 30): Promise<{ count: number }> => {
  const response = await apiRequest(
    '/api/appointment-slots/cleanup',
    {
      method: 'POST',
      body: JSON.stringify({ days_to_keep: daysToKeep }),
    }
  );
  
  if (!response.success) {
    throw new Error('Failed to cleanup old slots');
  }
  
  return { count: response.count };
};

/**
 * Helper function to get slot status color
 */
export const getSlotStatusColor = (status: SlotStatus): string => {
  const colors: Record<SlotStatus, string> = {
    free: 'green',
    busy: 'red',
    'busy-unavailable': 'gray',
    'busy-tentative': 'yellow',
  };
  return colors[status] || 'gray';
};

/**
 * Helper function to get slot status label
 */
export const getSlotStatusLabel = (status: SlotStatus): string => {
  const labels: Record<SlotStatus, string> = {
    free: 'Disponible',
    busy: 'Ocupado',
    'busy-unavailable': 'No Disponible',
    'busy-tentative': 'Tentativo',
  };
  return labels[status] || status;
};

/**
 * Helper function to format slot time range
 */
export const formatSlotTime = (slot: AppointmentSlot): string => {
  return `${slot.start_time} - ${slot.end_time}`;
};

/**
 * Helper function to group slots by date
 */
export const groupSlotsByDate = (slots: AppointmentSlot[]): Record<string, AppointmentSlot[]> => {
  return slots.reduce((acc, slot) => {
    const date = slot.slot_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, AppointmentSlot[]>);
};

/**
 * Helper function to filter available slots only
 */
export const filterAvailableSlots = (slots: AppointmentSlot[]): AppointmentSlot[] => {
  return slots.filter((slot) => slot.status === 'free' && !slot.is_blocked);
};
