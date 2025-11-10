/**
 * Patient Contact Service
 * Handles all API calls related to patient emergency contacts
 */

import { apiRequest } from '../api';

export interface PatientContact {
  id: number;
  patient_id: number;
  personal_info: {
    first_name: string;
    last_name: string;
    full_name: string;
    relationship: string;
  };
  contact_info: {
    phone: string;
    mobile_phone?: string;
    email?: string;
    address: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
      full_address: string;
    };
  };
  priority: {
    is_primary: boolean;
    priority_order: number;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientContactData {
  patient_id: number;
  first_name: string;
  last_name: string;
  relationship: string;
  phone: string;
  mobile_phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  is_primary?: boolean;
  priority_order?: number;
  notes?: string;
}

export interface UpdatePatientContactData extends Partial<Omit<CreatePatientContactData, 'patient_id'>> {}

export const patientContactService = {
  /**
   * Get all contacts for a patient
   */
  getAll: async (
    patientId: number
  ): Promise<{ success: boolean; data: PatientContact[]; count: number; error?: string }> => {
    return apiRequest(`/patient-contacts?patient_id=${patientId}`, { method: 'GET' });
  },

  /**
   * Get a single contact by ID
   */
  getById: async (
    contactId: number
  ): Promise<{ success: boolean; data: PatientContact; error?: string }> => {
    return apiRequest(`/patient-contacts/${contactId}`, { method: 'GET' });
  },

  /**
   * Create a new patient contact
   */
  create: async (
    contactData: CreatePatientContactData
  ): Promise<{ success: boolean; data: PatientContact; message?: string; error?: string }> => {
    return apiRequest('/patient-contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  /**
   * Update a patient contact
   */
  update: async (
    contactId: number,
    contactData: UpdatePatientContactData
  ): Promise<{ success: boolean; data: PatientContact; message?: string; error?: string }> => {
    return apiRequest(`/patient-contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  },

  /**
   * Delete a patient contact
   */
  delete: async (
    contactId: number
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    return apiRequest(`/patient-contacts/${contactId}`, { method: 'DELETE' });
  },

  /**
   * Set a contact as the primary emergency contact
   */
  setPrimary: async (
    contactId: number
  ): Promise<{ success: boolean; data: PatientContact; message?: string; error?: string }> => {
    return apiRequest(`/patient-contacts/${contactId}/set-primary`, {
      method: 'POST',
    });
  },

  /**
   * Reorder contacts for a patient
   */
  reorder: async (
    patientId: number,
    contactIds: number[]
  ): Promise<{ success: boolean; data: PatientContact[]; message?: string; error?: string }> => {
    return apiRequest(`/patient-contacts/patient/${patientId}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ contact_ids: contactIds }),
    });
  },
};
