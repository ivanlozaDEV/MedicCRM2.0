/**
 * RolePermission Service
 * Handles all API calls related to role-permission assignments
 */

import { apiRequest } from '../api';
import type { Role } from './roleService';
import type { Permission } from './permissionService';

export interface RolePermission {
  role_id: number;
  permission_id: number;
  assigned_by?: number;
  assigned_at: string;
}

export const rolePermissionService = {
  /**
   * Get all permissions for a role
   */
  getRolePermissions: async (role_id: number): Promise<{
    success: boolean;
    data: {
      role: Role;
      permissions: Permission[];
      count: number;
    };
  }> => {
    return apiRequest(`/role-permissions/role/${role_id}`, {
      method: 'GET',
    });
  },

  /**
   * Get all roles that have a specific permission
   */
  getPermissionRoles: async (permission_id: number): Promise<{
    success: boolean;
    data: {
      permission: Permission;
      roles: Role[];
      count: number;
    };
  }> => {
    return apiRequest(`/role-permissions/permission/${permission_id}/roles`, {
      method: 'GET',
    });
  },

  /**
   * Assign a permission to a role
   */
  assign: async (data: {
    role_id: number;
    permission_id: number;
    assigned_by?: number;
  }): Promise<{ success: boolean; message: string; data: RolePermission }> => {
    return apiRequest('/role-permissions/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Assign multiple permissions to a role
   */
  assignMultiple: async (data: {
    role_id: number;
    permission_ids: number[];
    assigned_by?: number;
  }): Promise<{ success: boolean; message: string; data: RolePermission[] }> => {
    return apiRequest('/role-permissions/assign-multiple', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Replace all permissions for a role
   */
  replace: async (data: {
    role_id: number;
    permission_ids: number[];
    assigned_by?: number;
  }): Promise<{ success: boolean; message: string; data: RolePermission[] }> => {
    return apiRequest('/role-permissions/replace', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Revoke a permission from a role
   */
  revoke: async (data: {
    role_id: number;
    permission_id: number;
  }): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/role-permissions/revoke', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
