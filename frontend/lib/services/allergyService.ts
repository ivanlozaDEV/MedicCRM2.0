/**
 * Allergy Catalog Service
 * Handles API calls to the global allergy catalog
 */

import { apiRequest } from '../api';

export interface Allergy {
  id: number;
  name: string;
  description?: string;
  codes: {
    snomed?: string;
    rxnorm?: string;
  };
  category?: string;
  type?: string;
  common_reactions?: string[];
  typical_severity?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAllergyData {
  name: string;
  description?: string;
  snomed_code?: string;
  rxnorm_code?: string;
  category?: string;
  allergy_type?: string;
  common_reactions?: string[];
  typical_severity?: string;
  is_active?: boolean;
}

export interface UpdateAllergyData extends Partial<Omit<CreateAllergyData, 'name'>> {
  name?: string;
}

export const allergyService = {
  /**
   * Get all allergies from catalog with optional filters
   */
  getAll: async (params?: {
    category?: string;
    search?: string;
    only_active?: boolean;
  }): Promise<{ success: boolean; data: Allergy[]; count: number; error?: string }> => {
    const queryParams = new URLSearchParams();
    
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.only_active !== undefined) {
      queryParams.append('only_active', params.only_active.toString());
    }
    
    const url = `/allergies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(url, { method: 'GET' });
  },

  /**
   * Get a single allergy by ID
   */
  getById: async (
    allergyId: number
  ): Promise<{ success: boolean; data: Allergy; error?: string }> => {
    return apiRequest(`/allergies/${allergyId}`, { method: 'GET' });
  },

  /**
   * Create a new allergy in the catalog (admin only)
   */
  create: async (
    allergyData: CreateAllergyData
  ): Promise<{ success: boolean; data: Allergy; message?: string; error?: string }> => {
    return apiRequest('/allergies', {
      method: 'POST',
      body: JSON.stringify(allergyData),
    });
  },

  /**
   * Update an allergy in the catalog (admin only)
   */
  update: async (
    allergyId: number,
    allergyData: UpdateAllergyData
  ): Promise<{ success: boolean; data: Allergy; message?: string; error?: string }> => {
    return apiRequest(`/allergies/${allergyId}`, {
      method: 'PUT',
      body: JSON.stringify(allergyData),
    });
  },

  /**
   * Delete (deactivate) an allergy from the catalog (admin only)
   */
  delete: async (
    allergyId: number
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    return apiRequest(`/allergies/${allergyId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get list of allergy categories
   */
  getCategories: async (): Promise<{ success: boolean; data: string[]; error?: string }> => {
    return apiRequest('/allergies/categories', { method: 'GET' });
  },
};
