/**
 * Patient Service
 * Handles all API calls related to patients
 */

import { apiRequest } from '../api';

export interface Patient {
  id: number;
  organization_id: number;
  personal_info: {
    first_name: string;
    last_name: string;
    full_name: string;
    date_of_birth: string;
    age: number | null;
    gender?: string;
    photo_url?: string;
  };
  contact_info: {
    email?: string;
    phone?: string;
    mobile_phone?: string;
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
  identification: {
    id_number?: string;
    id_type?: string;
  };
  medical_info: {
    blood_type?: string;
    allergies_notes?: string;
    conditions_notes?: string;
    medications_notes?: string;
    insurance_provider?: string;
    insurance_policy_number?: string;
  };
  additional_info: {
    occupation?: string;
    marital_status?: string;
    notes?: string;
  };
  emergency_contacts?: PatientContact[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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

export interface CreatePatientData {
  organization_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string; // YYYY-MM-DD format
  gender?: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  id_number?: string;
  id_type?: string;
  blood_type?: string;
  allergies_notes?: string;
  conditions_notes?: string;
  medications_notes?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  occupation?: string;
  marital_status?: string;
  notes?: string;
  photo_url?: string;
}

export interface UpdatePatientData extends Partial<CreatePatientData> {}

export interface PatientStats {
  total_patients: number;
  active_patients: number;
  inactive_patients: number;
  by_gender: {
    male: number;
    female: number;
  };
  new_this_month: number;
}

export const patientService = {
  /**
   * Get all patients
   */
  getAll: async (params?: {
    organization_id?: number;
    active_only?: boolean;
    include_contacts?: boolean;
    search?: string;
  }): Promise<{ success: boolean; data: Patient[]; count: number; error?: string }> => {
    const queryParams = new URLSearchParams();
    
    if (params?.organization_id) {
      queryParams.append('organization_id', params.organization_id.toString());
    }
    if (params?.active_only) {
      queryParams.append('active_only', 'true');
    }
    if (params?.include_contacts) {
      queryParams.append('include_contacts', 'true');
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }

    const url = `/patients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(url, { method: 'GET' });
  },

  /**
   * Get a single patient by ID
   */
  getById: async (
    patientId: number,
    includeContacts = false
  ): Promise<{ success: boolean; data: Patient; error?: string }> => {
    const url = `/patients/${patientId}${includeContacts ? '?include_contacts=true' : ''}`;
    return apiRequest(url, { method: 'GET' });
  },

  /**
   * Create a new patient
   */
  create: async (
    patientData: CreatePatientData
  ): Promise<{ success: boolean; data: Patient; message?: string; error?: string }> => {
    return apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },

  /**
   * Update a patient
   */
  update: async (
    patientId: number,
    patientData: UpdatePatientData
  ): Promise<{ success: boolean; data: Patient; message?: string; error?: string }> => {
    return apiRequest(`/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  },

  /**
   * Delete a patient (soft delete by default)
   */
  delete: async (
    patientId: number,
    hardDelete = false
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const url = `/patients/${patientId}${hardDelete ? '?hard=true' : ''}`;
    return apiRequest(url, { method: 'DELETE' });
  },

  /**
   * Activate a deactivated patient
   */
  activate: async (
    patientId: number
  ): Promise<{ success: boolean; data: Patient; message?: string; error?: string }> => {
    return apiRequest(`/patients/${patientId}/activate`, {
      method: 'POST',
    });
  },

  /**
   * Get patient statistics for an organization
   */
  getStats: async (
    organizationId: number
  ): Promise<{ success: boolean; data: PatientStats; error?: string }> => {
    return apiRequest(
      `/patients/stats?organization_id=${organizationId}`,
      { method: 'GET' }
    );
  },
};
