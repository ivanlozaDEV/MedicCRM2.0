/**
 * User Service
 * Handles all API calls related to users
 */

import { apiRequest } from '../api';

export interface User {
  id: number;
  organization_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  photo_url?: string;
  professional_info: {
    medical_license?: string;
    professional_id?: string;
    is_medical_professional: boolean;
    specialties?: any[];
    primary_specialty?: any;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  organization_id: number;
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  photo_url?: string;
  medical_license?: string;
  professional_id?: string;
}

export const userService = {
  /**
   * Get all users
   */
  getAll: async (params?: {
    organization_id?: number;
    active_only?: boolean;
    medical_only?: boolean;
    include_specialties?: boolean;
  }): Promise<{ success: boolean; data: User[]; count: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.organization_id) searchParams.append('organization_id', params.organization_id.toString());
    if (params?.active_only) searchParams.append('active_only', 'true');
    if (params?.medical_only) searchParams.append('medical_only', 'true');
    if (params?.include_specialties) searchParams.append('include_specialties', 'true');
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest(`/users${query}`, {
      method: 'GET',
    });
  },

  /**
   * Get a single user by ID
   */
  getById: async (id: number, include_specialties = false): Promise<{ success: boolean; data: User }> => {
    const query = include_specialties ? '?include_specialties=true' : '';
    return apiRequest(`/users/${id}${query}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new user
   */
  create: async (data: CreateUserData): Promise<{ success: boolean; message: string; data: User }> => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a user
   */
  update: async (id: number, data: Partial<User>): Promise<{ success: boolean; message: string; data: User }> => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Deactivate a user (soft delete)
   */
  deactivate: async (id: number): Promise<{ success: boolean; message: string; data: User }> => {
    return apiRequest(`/users/${id}/deactivate`, {
      method: 'POST',
    });
  },

  /**
   * Activate a user
   */
  activate: async (id: number): Promise<{ success: boolean; message: string; data: User }> => {
    return apiRequest(`/users/${id}/activate`, {
      method: 'POST',
    });
  },

  /**
   * Delete a user permanently
   */
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Request password reset token
   */
  requestPasswordReset: async (id: number): Promise<{ success: boolean; message: string; data: { reset_token: string; expires_at: string } }> => {
    return apiRequest(`/users/${id}/password-reset`, {
      method: 'POST',
    });
  },

  /**
   * Validate username availability
   */
  validateUsername: async (username: string): Promise<{ success: boolean; available: boolean }> => {
    return apiRequest('/users/validate-username', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  },

  /**
   * Validate email availability
   */
  validateEmail: async (email: string): Promise<{ success: boolean; available: boolean }> => {
    return apiRequest('/users/validate-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};
