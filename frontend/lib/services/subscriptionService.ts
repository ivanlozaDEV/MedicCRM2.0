/**
 * Subscription Service
 * Handles all API calls related to subscriptions
 */

import { apiRequest } from '../api';

export interface Subscription {
  id: number;
  organization_id: number;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'canceled' | 'expired' | 'trial';
  start_date: string;
  end_date?: string;
  trial_end_date?: string;
  max_users?: number;
  max_patients?: number;
  max_appointments_per_month?: number;
  lemonsqueezy_subscription_id?: string;
  lemonsqueezy_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export const subscriptionService = {
  /**
   * Get all subscriptions
   */
  getAll: async (params?: {
    organization_id?: number;
    plan?: string;
    status?: string;
  }): Promise<{ success: boolean; data: Subscription[]; count: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.organization_id) searchParams.append('organization_id', params.organization_id.toString());
    if (params?.plan) searchParams.append('plan', params.plan);
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest(`/subscriptions${query}`, {
      method: 'GET',
    });
  },

  /**
   * Get a single subscription by ID
   */
  getById: async (id: number): Promise<{ success: boolean; data: Subscription }> => {
    return apiRequest(`/subscriptions/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new subscription
   */
  create: async (data: Partial<Subscription>): Promise<{ success: boolean; message: string; data: Subscription }> => {
    return apiRequest('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a subscription
   */
  update: async (id: number, data: Partial<Subscription>): Promise<{ success: boolean; message: string; data: Subscription }> => {
    return apiRequest(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cancel a subscription
   */
  cancel: async (id: number): Promise<{ success: boolean; message: string; data: Subscription }> => {
    return apiRequest(`/subscriptions/${id}/cancel`, {
      method: 'POST',
    });
  },

  /**
   * Renew a subscription
   */
  renew: async (id: number): Promise<{ success: boolean; message: string; data: Subscription }> => {
    return apiRequest(`/subscriptions/${id}/renew`, {
      method: 'POST',
    });
  },

  /**
   * Delete a subscription permanently
   */
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/subscriptions/${id}`, {
      method: 'DELETE',
    });
  },
};
