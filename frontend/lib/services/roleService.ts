/**
 * Role Service
 * Handles all API calls related to roles (system and custom)
 */

import { apiRequest } from '../api';

export interface Role {
  id: number;
  organization_id: number;
  name: string;
  description?: string;
  color: string;
  is_system: boolean;
  is_admin: boolean;
  user_count: number;
  permission_count: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export const roleService = {
  /**
   * Get all roles for an organization
   */
  getAll: async (organization_id: number, params?: {
    system_only?: boolean;
    custom_only?: boolean;
  }): Promise<{ success: boolean; data: Role[]; count: number }> => {
    const searchParams = new URLSearchParams({ organization_id: organization_id.toString() });
    if (params?.system_only) searchParams.append('system_only', 'true');
    if (params?.custom_only) searchParams.append('custom_only', 'true');
    
    return apiRequest(`/roles?${searchParams.toString()}`, {
      method: 'GET',
    });
  },

  /**
   * Get a single role by ID
   */
  getById: async (id: number): Promise<{ success: boolean; data: Role }> => {
    return apiRequest(`/roles/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new custom role
   */
  create: async (data: {
    organization_id: number;
    name: string;
    description?: string;
    color?: string;
    created_by?: number;
  }): Promise<{ success: boolean; message: string; data: Role }> => {
    return apiRequest('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a role (system roles cannot be renamed)
   */
  update: async (id: number, data: Partial<Role>): Promise<{ success: boolean; message: string; data: Role }> => {
    return apiRequest(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a role (system roles cannot be deleted)
   */
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/roles/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Initialize system roles for an organization
   */
  initSystemRoles: async (organization_id: number): Promise<{ success: boolean; message: string; data: Role[] }> => {
    return apiRequest(`/roles/organization/${organization_id}/init-system-roles`, {
      method: 'POST',
    });
  },

  /**
   * Get permissions assigned to a role
   */
  getPermissions: async (roleId: number): Promise<{ success: boolean; data: any }> => {
    return apiRequest(`/roles/${roleId}/permissions`, {
      method: 'GET',
    });
  },

  /**
   * Update permissions for a role
   */
  updatePermissions: async (roleId: number, permissionIds: number[]): Promise<{ success: boolean; message: string; data: any }> => {
    return apiRequest(`/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permission_ids: permissionIds }),
    });
  },
};
