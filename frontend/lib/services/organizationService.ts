/**
 * Organization Service
 * Handles all API calls related to organizations
 */

import { apiRequest } from '../api';

export interface Organization {
  id: number;
  name: string;
  slug?: string;
  legal_name?: string;
  tax_id?: string;
  description?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  success_color?: string;
  warning_color?: string;
  error_color?: string;
  info_color?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone?: string;
  currency?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationStats {
  organization: Organization;
  user_count: number;
  active_subscription: any;
}

export const organizationService = {
  /**
   * Get all organizations
   */
  getAll: async (params?: { active_only?: boolean }): Promise<{ success: boolean; data: Organization[]; count: number }> => {
    const query = params?.active_only ? '?active_only=true' : '';
    return apiRequest(`/organizations${query}`, {
      method: 'GET',
    });
  },

  /**
   * Get a single organization by ID
   */
  getById: async (id: number): Promise<{ success: boolean; data: Organization }> => {
    return apiRequest(`/organizations/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new organization
   */
  create: async (data: Partial<Organization>): Promise<{ success: boolean; message: string; data: Organization }> => {
    return apiRequest('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an organization
   */
  update: async (id: number, data: Partial<Organization>): Promise<{ success: boolean; message: string; data: Organization }> => {
    return apiRequest(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Deactivate an organization (soft delete)
   */
  deactivate: async (id: number): Promise<{ success: boolean; message: string; data: Organization }> => {
    return apiRequest(`/organizations/${id}/deactivate`, {
      method: 'POST',
    });
  },

  /**
   * Activate an organization
   */
  activate: async (id: number): Promise<{ success: boolean; message: string; data: Organization }> => {
    return apiRequest(`/organizations/${id}/activate`, {
      method: 'POST',
    });
  },

  /**
   * Delete an organization permanently
   */
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/organizations/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get organization statistics
   */
  getStats: async (id: number): Promise<{ success: boolean; data: OrganizationStats }> => {
    return apiRequest(`/organizations/${id}/stats`, {
      method: 'GET',
    });
  },
};
