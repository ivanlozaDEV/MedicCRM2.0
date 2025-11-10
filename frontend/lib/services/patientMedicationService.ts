/**
 * Patient Medication Service
 * Handles all API calls related to patient medications
 */

import { apiRequest } from '../api';

export interface PatientMedication {
  id: number;
  patient_id: number;
  medication: {
    name: string;
    code?: string;
    system?: string;
  };
  status: string;
  is_current: boolean;
  dosage: {
    text?: string;
    dose?: string;
    route?: string;
    frequency?: string;
    is_prn: boolean;
  };
  timing: {
    start_date?: string;
    end_date?: string;
  };
  reason: {
    code?: string;
    text?: string;
  };
  prescriber_name?: string;
  pharmacy?: string;
  refills_remaining?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientMedicationData {
  patient_id: number;
  medication_name: string;
  medication_code?: string;
  medication_system?: string;
  status?: string;
  dosage_text?: string;
  dose?: string;
  route?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  reason_code?: string;
  reason_text?: string;
  prescriber_name?: string;
  prescriber_id?: number;
  pharmacy?: string;
  refills_remaining?: number;
  is_prn?: boolean;
  notes?: string;
}

export interface UpdatePatientMedicationData extends Partial<Omit<CreatePatientMedicationData, 'patient_id'>> {}

export const patientMedicationService = {
  /**
   * Get all medications for a patient
   */
  getAll: async (
    patientId: number,
    params?: {
      status?: string;
      current_only?: boolean;
      include_prescriber?: boolean;
    }
  ): Promise<{ success: boolean; data: PatientMedication[]; count: number; error?: string }> => {
    const queryParams = new URLSearchParams({ patient_id: patientId.toString() });
    if (params?.status) queryParams.append('status', params.status);
    if (params?.current_only) queryParams.append('current_only', 'true');
    if (params?.include_prescriber) queryParams.append('include_prescriber', 'true');
    
    return apiRequest(`/patient-medications?${queryParams.toString()}`, { method: 'GET' });
  },

  /**
   * Get a single medication by ID
   */
  getById: async (
    medicationId: number,
    includePrescriber = false
  ): Promise<{ success: boolean; data: PatientMedication; error?: string }> => {
    const url = `/patient-medications/${medicationId}${includePrescriber ? '?include_prescriber=true' : ''}`;
    return apiRequest(url, { method: 'GET' });
  },

  /**
   * Create a new patient medication
   */
  create: async (
    medicationData: CreatePatientMedicationData
  ): Promise<{ success: boolean; data: PatientMedication; message?: string; error?: string }> => {
    return apiRequest('/patient-medications', {
      method: 'POST',
      body: JSON.stringify(medicationData),
    });
  },

  /**
   * Update a patient medication
   */
  update: async (
    medicationId: number,
    medicationData: UpdatePatientMedicationData
  ): Promise<{ success: boolean; data: PatientMedication; message?: string; error?: string }> => {
    return apiRequest(`/patient-medications/${medicationId}`, {
      method: 'PUT',
      body: JSON.stringify(medicationData),
    });
  },

  /**
   * Delete a patient medication
   */
  delete: async (
    medicationId: number
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    return apiRequest(`/patient-medications/${medicationId}`, { method: 'DELETE' });
  },

  /**
   * Discontinue a medication
   */
  discontinue: async (
    medicationId: number,
    reason?: string
  ): Promise<{ success: boolean; data: PatientMedication; message?: string; error?: string }> => {
    return apiRequest(`/patient-medications/${medicationId}/discontinue`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
