/**
 * Patient Condition Service
 * Handles all API calls related to patient conditions
 */

import { apiRequest } from '../api';

export interface PatientCondition {
  id: number;
  patient_id: number;
  condition: {
    name: string;
    code?: string;
    system?: string;
  };
  clinical_status: string;
  verification_status: string;
  category?: string;
  severity?: string;
  is_active: boolean;
  dates: {
    onset?: string;
    recorded?: string;
    abatement?: string;
    duration_days?: number;
  };
  clinical_info: {
    body_site?: string;
    stage?: string;
  };
  recorder_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientConditionData {
  patient_id: number;
  condition_name: string;
  condition_code?: string;
  condition_system?: string;
  clinical_status?: string;
  verification_status?: string;
  category?: string;
  severity?: string;
  onset_date?: string;
  abatement_date?: string;
  body_site?: string;
  stage?: string;
  recorder_name?: string;
  recorder_id?: number;
  notes?: string;
}

export interface UpdatePatientConditionData extends Partial<Omit<CreatePatientConditionData, 'patient_id'>> {}

export const patientConditionService = {
  /**
   * Get all conditions for a patient
   */
  getAll: async (
    patientId: number,
    params?: {
      clinical_status?: string;
      active_only?: boolean;
      include_recorder?: boolean;
    }
  ): Promise<{ success: boolean; data: PatientCondition[]; count: number; error?: string }> => {
    const queryParams = new URLSearchParams({ patient_id: patientId.toString() });
    if (params?.clinical_status) queryParams.append('clinical_status', params.clinical_status);
    if (params?.active_only) queryParams.append('active_only', 'true');
    if (params?.include_recorder) queryParams.append('include_recorder', 'true');
    
    return apiRequest(`/patient-conditions?${queryParams.toString()}`, { method: 'GET' });
  },

  /**
   * Get a single condition by ID
   */
  getById: async (
    conditionId: number,
    includeRecorder = false
  ): Promise<{ success: boolean; data: PatientCondition; error?: string }> => {
    const url = `/patient-conditions/${conditionId}${includeRecorder ? '?include_recorder=true' : ''}`;
    return apiRequest(url, { method: 'GET' });
  },

  /**
   * Create a new patient condition
   */
  create: async (
    conditionData: CreatePatientConditionData
  ): Promise<{ success: boolean; data: PatientCondition; message?: string; error?: string }> => {
    return apiRequest('/patient-conditions', {
      method: 'POST',
      body: JSON.stringify(conditionData),
    });
  },

  /**
   * Update a patient condition
   */
  update: async (
    conditionId: number,
    conditionData: UpdatePatientConditionData
  ): Promise<{ success: boolean; data: PatientCondition; message?: string; error?: string }> => {
    return apiRequest(`/patient-conditions/${conditionId}`, {
      method: 'PUT',
      body: JSON.stringify(conditionData),
    });
  },

  /**
   * Delete a patient condition
   */
  delete: async (
    conditionId: number
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    return apiRequest(`/patient-conditions/${conditionId}`, { method: 'DELETE' });
  },

  /**
   * Mark a condition as resolved
   */
  resolve: async (
    conditionId: number,
    abatementDate?: string,
    notes?: string
  ): Promise<{ success: boolean; data: PatientCondition; message?: string; error?: string }> => {
    return apiRequest(`/patient-conditions/${conditionId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ abatement_date: abatementDate, notes }),
    });
  },
};
