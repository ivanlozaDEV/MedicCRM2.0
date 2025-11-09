/**
 * Auth Service
 * Handles authentication-related API calls
 */

import { apiRequest } from '../api';
import type { User } from './userService';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  organization_name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    organization: any;
    token?: string;
  };
}

export interface CurrentUserResponse {
  success: boolean;
  data: {
    user: User;
    organization: any;
    permissions: string[];
    roles: any[];
  };
}

export const authService = {
  /**
   * Login with email and password
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Sign up - Create new organization and admin user
   */
  signup: async (data: SignupData): Promise<AuthResponse> => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get current authenticated user with permissions
   */
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Logout
   */
  logout: async (): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Google OAuth login
   */
  googleLogin: async (credential: string): Promise<AuthResponse> => {
    return apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },
};
