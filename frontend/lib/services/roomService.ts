/**
 * Room Service
 * Handles all API calls related to rooms/consultation locations
 */

import { apiRequest } from '../api';

export interface Room {
  id: number;
  organization_id: number;
  name: string;
  location?: string;
  floor?: string;
  building?: string;
  room_type: 'consultation' | 'procedure' | 'emergency' | 'virtual' | 'other';
  capacity?: number;
  equipment?: string;
  is_virtual: boolean;
  virtual_link?: string;
  is_available: boolean;
  is_active: boolean;
  full_location: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateRoomData {
  organization_id: number;
  name: string;
  location?: string;
  floor?: string;
  building?: string;
  room_type: 'consultation' | 'procedure' | 'emergency' | 'virtual' | 'other';
  capacity?: number;
  equipment?: string;
  is_virtual?: boolean;
  virtual_link?: string;
  is_available?: boolean;
}

export interface UpdateRoomData {
  name?: string;
  location?: string;
  floor?: string;
  building?: string;
  room_type?: 'consultation' | 'procedure' | 'emergency' | 'virtual' | 'other';
  capacity?: number;
  equipment?: string;
  is_virtual?: boolean;
  virtual_link?: string;
  is_available?: boolean;
  is_active?: boolean;
}

/**
 * Get all rooms for an organization
 */
export const getRooms = async (
  organizationId: number,
  availableOnly = false
): Promise<Room[]> => {
  const params = new URLSearchParams();
  params.append('organization_id', organizationId.toString());
  if (availableOnly) {
    params.append('available_only', 'true');
  }
  
  const response = await apiRequest(
    `/api/rooms?${params.toString()}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch rooms');
  }
  
  return response.data;
};

/**
 * Get a single room by ID
 */
export const getRoom = async (id: number): Promise<Room> => {
  const response = await apiRequest(
    `/api/rooms/${id}`,
    { method: 'GET' }
  );
  
  if (!response.success) {
    throw new Error('Failed to fetch room');
  }
  
  return response.data;
};

/**
 * Create a new room
 */
export const createRoom = async (data: CreateRoomData): Promise<Room> => {
  const response = await apiRequest(
    '/api/rooms',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  
  if (!response.success) {
    throw new Error('Failed to create room');
  }
  
  return response.data;
};

/**
 * Update a room
 */
export const updateRoom = async (id: number, data: UpdateRoomData): Promise<Room> => {
  const response = await apiRequest(
    `/api/rooms/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  
  if (!response.success) {
    throw new Error('Failed to update room');
  }
  
  return response.data;
};

/**
 * Delete a room
 */
export const deleteRoom = async (id: number): Promise<void> => {
  const response = await apiRequest(
    `/api/rooms/${id}`,
    { method: 'DELETE' }
  );
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete room');
  }
};

/**
 * Get available rooms for an organization
 */
export const getAvailableRooms = async (organizationId: number): Promise<Room[]> => {
  return getRooms(organizationId, true);
};
