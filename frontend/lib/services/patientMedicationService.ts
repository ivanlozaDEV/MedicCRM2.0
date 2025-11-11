/**
 * Patient Medication Service
 * Handles all API calls related to patient medications
 */

import { apiRequest } from '../api';

export interface PatientMedication {
  id: number;
  patient_id: number;
  medication_id?: number | null;
  medication_name: string;
  medication_code?: string;
  medication_system?: string;
  status: string;
  dosage_text?: string;
  dose?: string;
  route?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  reason_code?: string;
  reason_text?: string;
  prescriber_name?: string;
  prescriber_id?: number | null;
  pharmacy?: string;
  refills_remaining?: number | null;
  is_prn: boolean;
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
  getAll: async (patientId: number): Promise<{ success: boolean; data: PatientMedication[]; count: number; error?: string }> => {
    return apiRequest(`/api/patient-medications?patient_id=${patientId}`, { method: 'GET' });
  },

  /**
   * Get a single medication by ID
   */
  getById: async (medicationId: number): Promise<{ success: boolean; data: PatientMedication; error?: string }> => {
    return apiRequest(`/api/patient-medications/${medicationId}`, { method: 'GET' });
  },

  /**
   * Create a new patient medication
   */
  create: async (
    patientId: number,
    medicationData: Omit<CreatePatientMedicationData, 'patient_id'>
  ): Promise<{ success: boolean; data: PatientMedication; message?: string; error?: string }> => {
    return apiRequest('/api/patient-medications', {
      method: 'POST',
      body: JSON.stringify({ ...medicationData, patient_id: patientId }),
    });
  },

  /**
   * Update a patient medication
   */
  update: async (
    patientId: number,
    medicationId: number,
    medicationData: UpdatePatientMedicationData
  ): Promise<{ success: boolean; data: PatientMedication; message?: string; error?: string }> => {
    return apiRequest(`/api/patient-medications/${medicationId}`, {
      method: 'PUT',
      body: JSON.stringify(medicationData),
    });
  },

  /**
   * Delete a patient medication
   */
  delete: async (
    patientId: number,
    medicationId: number
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    return apiRequest(`/api/patient-medications/${medicationId}`, { method: 'DELETE' });
  },
};
