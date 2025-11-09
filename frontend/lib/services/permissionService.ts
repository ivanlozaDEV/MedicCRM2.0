/**
 * Permission Service
 * Handles all API calls related to permissions
 */

import { apiRequest } from '../api';

export interface Permission {
  id: number;
  module_key: string;
  display_name: string;
  description?: string;
  category: 'clinical' | 'administrative' | 'system';
  created_at: string;
}

export interface PermissionsGrouped {
  clinical: Permission[];
  administrative: Permission[];
  system: Permission[];
}

export const permissionService = {
  /**
   * Get all permissions
   */
  getAll: async (params?: {
    category?: string;
    grouped?: boolean;
  }): Promise<{ success: boolean; data: Permission[] | PermissionsGrouped; count?: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.grouped) searchParams.append('grouped', 'true');
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest(`/permissions${query}`, {
      method: 'GET',
    });
  },

  /**
   * Get a single permission by ID
   */
  getById: async (id: number): Promise<{ success: boolean; data: Permission }> => {
    return apiRequest(`/permissions/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Get a permission by module key
   */
  getByKey: async (module_key: string): Promise<{ success: boolean; data: Permission }> => {
    return apiRequest(`/permissions/key/${module_key}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new permission
   */
  create: async (data: {
    module_key: string;
    display_name: string;
    category: string;
    description?: string;
  }): Promise<{ success: boolean; message: string; data: Permission }> => {
    return apiRequest('/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a permission
   */
  update: async (id: number, data: Partial<Permission>): Promise<{ success: boolean; message: string; data: Permission }> => {
    return apiRequest(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a permission
   */
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/permissions/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get available permission categories
   */
  getCategories: async (): Promise<{ success: boolean; data: string[] }> => {
    return apiRequest('/permissions/categories', {
      method: 'GET',
    });
  },
};
