/**
 * Condition Catalog Service
 * Handles API calls to the global condition catalog
 */

import { apiRequest } from '../api';

export interface Condition {
  id: number;
  name: string;
  description?: string;
  icd10_code?: string;
  snomed_code?: string;
  category?: string;
  typical_severity?: string;
  is_chronic: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateConditionData {
  name: string;
  description?: string;
  icd10_code?: string;
  snomed_code?: string;
  category?: string;
  typical_severity?: string;
  is_chronic?: boolean;
  is_active?: boolean;
}

export interface UpdateConditionData extends Partial<Omit<CreateConditionData, 'name'>> {
  name?: string;
}

export const conditionService = {
  /**
   * Get all conditions from catalog with optional filters
   */
  getAll: async (params?: {
    category?: string;
    search?: string;
    only_active?: boolean;
    is_chronic?: boolean;
  }): Promise<{ success: boolean; data: Condition[]; count: number; error?: string }> => {
    const queryParams = new URLSearchParams();
    
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.only_active !== undefined) {
      queryParams.append('only_active', params.only_active.toString());
    }
    if (params?.is_chronic !== undefined) {
      queryParams.append('is_chronic', params.is_chronic.toString());
    }
    
    const url = `/conditions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(url, { method: 'GET' });
  },

  /**
   * Get a single condition by ID
   */
  getById: async (
    conditionId: number
  ): Promise<{ success: boolean; data: Condition; error?: string }> => {
    return apiRequest(`/conditions/${conditionId}`, { method: 'GET' });
  },

  /**
   * Create a new condition in the catalog (admin only)
   */
  create: async (
    conditionData: CreateConditionData
  ): Promise<{ success: boolean; data: Condition; message?: string; error?: string }> => {
    return apiRequest('/conditions', {
      method: 'POST',
      body: JSON.stringify(conditionData),
    });
  },

  /**
   * Update a condition in the catalog (admin only)
   */
  update: async (
    conditionId: number,
    conditionData: UpdateConditionData
  ): Promise<{ success: boolean; data: Condition; message?: string; error?: string }> => {
    return apiRequest(`/conditions/${conditionId}`, {
      method: 'PUT',
      body: JSON.stringify(conditionData),
    });
  },

  /**
   * Delete (deactivate) a condition from the catalog (admin only)
   */
  delete: async (
    conditionId: number
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    return apiRequest(`/conditions/${conditionId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get list of condition categories
   */
  getCategories: async (): Promise<{ success: boolean; data: string[]; error?: string }> => {
    return apiRequest('/conditions/categories', { method: 'GET' });
  },

  /**
   * Search conditions by name
   */
  search: async (
    query: string
  ): Promise<{ success: boolean; data: Condition[]; count: number; error?: string }> => {
    return apiRequest(`/conditions/search?q=${encodeURIComponent(query)}`, { method: 'GET' });
  },

  /**
   * Get condition statistics
   */
  getStats: async (): Promise<{ 
    success: boolean; 
    data: {
      total: number;
      active: number;
      chronic: number;
      by_category: Record<string, number>;
      by_severity: Record<string, number>;
    };
    error?: string 
  }> => {
    return apiRequest('/conditions/stats', { method: 'GET' });
  },
};
