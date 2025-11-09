/**
 * UserSpecialty Service
 * Handles all API calls related to user-specialty assignments
 */

import { apiRequest } from '../api';
import type { User } from './userService';
import type { Specialty } from './specialtyService';

export interface UserSpecialty {
  user_id: number;
  specialty_id: number;
  is_primary: boolean;
  assigned_by?: number;
  assigned_at: string;
}

export const userSpecialtyService = {
  /**
   * Get all specialties for a user
   */
  getUserSpecialties: async (user_id: number, params?: { active_only?: boolean }): Promise<{
    success: boolean;
    data: {
      user: User;
      specialties: Specialty[];
      primary_specialty: Specialty | null;
      count: number;
    };
  }> => {
    const query = params?.active_only === false ? '?active_only=false' : '?active_only=true';
    return apiRequest(`/user-specialties/user/${user_id}${query}`, {
      method: 'GET',
    });
  },

  /**
   * Get all users with a specific specialty
   */
  getSpecialtyUsers: async (specialty_id: number): Promise<{
    success: boolean;
    data: {
      specialty: Specialty;
      users: User[];
      count: number;
    };
  }> => {
    return apiRequest(`/user-specialties/specialty/${specialty_id}/users`, {
      method: 'GET',
    });
  },

  /**
   * Assign a specialty to a user
   */
  assign: async (data: {
    user_id: number;
    specialty_id: number;
    is_primary?: boolean;
    assigned_by?: number;
  }): Promise<{ success: boolean; message: string; data: UserSpecialty }> => {
    return apiRequest('/user-specialties/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Assign multiple specialties to a user
   */
  assignMultiple: async (data: {
    user_id: number;
    specialty_ids: number[];
    primary_specialty_id?: number;
    assigned_by?: number;
  }): Promise<{ success: boolean; message: string; data: UserSpecialty[] }> => {
    return apiRequest('/user-specialties/assign-multiple', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Replace all specialties for a user
   */
  replace: async (data: {
    user_id: number;
    specialty_ids: number[];
    primary_specialty_id?: number;
    assigned_by?: number;
  }): Promise<{ success: boolean; message: string; data: UserSpecialty[] }> => {
    return apiRequest('/user-specialties/replace', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Set a specialty as primary for a user
   */
  setPrimary: async (data: {
    user_id: number;
    specialty_id: number;
  }): Promise<{ success: boolean; message: string; data: UserSpecialty }> => {
    return apiRequest('/user-specialties/set-primary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Revoke a specialty from a user
   */
  revoke: async (data: {
    user_id: number;
    specialty_id: number;
  }): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/user-specialties/revoke', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
