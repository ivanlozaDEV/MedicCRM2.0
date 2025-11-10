/**
 * Subscription Service
 * Handles all API calls related to subscriptions
 */

import { apiRequest } from '../api';

export interface Subscription {
  id: number;
  organization_id: number;
  plan: {
    name: string;
    price: number;
    billing_cycle: string;
  };
  status: string;
  is_active: boolean;
  is_trial: boolean;
  is_expired: boolean;
  dates: {
    trial_end: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    canceled_at: string | null;
    days_until_expiry: number | null;
  };
  lemonsqueezy: {
    subscription_id: string | null;
    customer_id: string | null;
    variant_id: string | null;
  };
  limits: {
    max_users: number;
    max_patients: number;
  };
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

  /**
   * Create a checkout session for upgrading/activating a plan
   */
  createCheckout: async (params: {
    plan_name: string;
    billing_cycle?: 'monthly' | 'yearly';
    organization_id: number;
    user_id: number;
    user_email: string;
    organization_name?: string;
  }): Promise<{ 
    success: boolean; 
    data?: { checkout_url: string; plan_name: string; billing_cycle: string }; 
    error?: string 
  }> => {
    return apiRequest('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({
        plan_name: params.plan_name,
        billing_cycle: params.billing_cycle || 'monthly',
        organization_id: params.organization_id,
        user_id: params.user_id,
        user_email: params.user_email,
        organization_name: params.organization_name
      }),
    });
  },
};
