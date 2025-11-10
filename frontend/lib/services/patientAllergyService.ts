/**
 * Patient Allergy Service
 * Handles all API calls related to patient allergies
 */

import { apiRequest } from '../api';

export interface PatientAllergy {
  id: number;
  patient_id: number;
  allergen: {
    name: string;
    code?: string;
    system?: string;
  };
  clinical_status: string;
  verification_status: string;
  type?: string;
  category?: string;
  criticality?: string;
  reaction: {
    description?: string;
    severity?: string;
    manifestation?: string;
  };
  dates: {
    onset?: string;
    recorded?: string;
    last_occurrence?: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientAllergyData {
  patient_id: number;
  allergen: string;
  allergen_code?: string;
  allergen_system?: string;
  clinical_status?: string;
  verification_status?: string;
  allergy_type?: string;
  category?: string;
  criticality?: string;
  reaction_description?: string;
  severity?: string;
  manifestation?: string;
  onset_date?: string;
  last_occurrence?: string;
  notes?: string;
}

export interface UpdatePatientAllergyData extends Partial<Omit<CreatePatientAllergyData, 'patient_id'>> {}

export const patientAllergyService = {
  /**
   * Get all allergies for a patient
   */
  getAll: async (
    patientId: number,
    clinicalStatus?: string
  ): Promise<{ success: boolean; data: PatientAllergy[]; count: number; error?: string }> => {
    const params = new URLSearchParams({ patient_id: patientId.toString() });
    if (clinicalStatus) params.append('clinical_status', clinicalStatus);
    
    return apiRequest(`/patient-allergies?${params.toString()}`, { method: 'GET' });
  },

  /**
   * Get a single allergy by ID
   */
  getById: async (
    allergyId: number
  ): Promise<{ success: boolean; data: PatientAllergy; error?: string }> => {
    return apiRequest(`/patient-allergies/${allergyId}`, { method: 'GET' });
  },

  /**
   * Create a new patient allergy
   */
  create: async (
    allergyData: CreatePatientAllergyData
  ): Promise<{ success: boolean; data: PatientAllergy; message?: string; error?: string }> => {
    return apiRequest('/patient-allergies', {
      method: 'POST',
      body: JSON.stringify(allergyData),
    });
  },

  /**
   * Update a patient allergy
   */
  update: async (
    allergyId: number,
    allergyData: UpdatePatientAllergyData
  ): Promise<{ success: boolean; data: PatientAllergy; message?: string; error?: string }> => {
    return apiRequest(`/patient-allergies/${allergyId}`, {
      method: 'PUT',
      body: JSON.stringify(allergyData),
    });
  },

  /**
   * Delete a patient allergy
   */
  delete: async (
    allergyId: number
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    return apiRequest(`/patient-allergies/${allergyId}`, { method: 'DELETE' });
  },
};
