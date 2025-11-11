/**
 * Medication Catalog Service
 * API service for managing the global medication catalog
 */

import { apiRequest } from '../api';

export interface MedicationCatalog {
  id: number;
  name: string;
  generic_name?: string;
  brand_names?: string[];
  description?: string;
  codes: {
    rxnorm?: string;
    ndc?: string;
    atc?: string;
  };
  category?: string;
  drug_class?: string;
  typical_info: {
    doses?: string[];
    routes?: string[];
    frequencies?: string[];
  };
  common_indications?: string[];
  safety: {
    requires_prescription: boolean;
    controlled_substance?: string;
  };
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationCatalogFilters {
  search?: string;
  category?: string;
  is_active?: boolean;
}

export interface MedicationCatalogFormData {
  name: string;
  generic_name?: string;
  brand_names?: string[];
  description?: string;
  rxnorm_code?: string;
  ndc_code?: string;
  atc_code?: string;
  category?: string;
  drug_class?: string;
  typical_doses?: string[];
  typical_routes?: string[];
  typical_frequencies?: string[];
  common_indications?: string[];
  requires_prescription?: boolean;
  controlled_substance?: string;
  is_active?: boolean;
}

class MedicationService {
  private readonly basePath = '/medications';

  /**
   * Get all medications from catalog with optional filters
   */
  async getAll(filters?: MedicationCatalogFilters): Promise<MedicationCatalog[]> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    const response = await apiRequest(url, { method: 'GET' });
    return response.data;
  }

  /**
   * Get medication by ID
   */
  async getById(id: number): Promise<MedicationCatalog> {
    const response = await apiRequest(`${this.basePath}/${id}`, { method: 'GET' });
    return response.data;
  }

  /**
   * Create new medication in catalog
   */
  async create(data: MedicationCatalogFormData): Promise<MedicationCatalog> {
    const response = await apiRequest(this.basePath, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.data;
  }

  /**
   * Update existing medication
   */
  async update(id: number, data: Partial<MedicationCatalogFormData>): Promise<MedicationCatalog> {
    const response = await apiRequest(`${this.basePath}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.data;
  }

  /**
   * Delete medication (soft delete - marks as inactive)
   */
  async delete(id: number): Promise<void> {
    await apiRequest(`${this.basePath}/${id}`, { method: 'DELETE' });
  }

  /**
   * Get all unique medication categories
   */
  async getCategories(): Promise<string[]> {
    const response = await apiRequest(`${this.basePath}/categories`, { method: 'GET' });
    return response.data;
  }

  /**
   * Search medications by name (helper method)
   */
  async search(searchTerm: string): Promise<MedicationCatalog[]> {
    return this.getAll({ search: searchTerm, is_active: true });
  }

  /**
   * Get medications by category
   */
  async getByCategory(category: string): Promise<MedicationCatalog[]> {
    return this.getAll({ category, is_active: true });
  }
}

export const medicationService = new MedicationService();
export default medicationService;
