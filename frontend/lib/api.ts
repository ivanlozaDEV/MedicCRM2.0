// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// API Helper Functions
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = localStorage.getItem('access_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  
  register: async (username: string, email: string, password: string, role: string = 'user') => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    });
  },
};

// Patients API
export const patientsAPI = {
  getAll: async () => {
    return apiRequest('/patients');
  },
  
  getById: async (id: number) => {
    return apiRequest(`/patients/${id}`);
  },
  
  create: async (patientData: any) => {
    return apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },
  
  update: async (id: number, patientData: any) => {
    return apiRequest(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  },
  
  delete: async (id: number) => {
    return apiRequest(`/patients/${id}`, {
      method: 'DELETE',
    });
  },
};

// Appointments API
export const appointmentsAPI = {
  getAll: async () => {
    return apiRequest('/appointments');
  },
  
  getById: async (id: number) => {
    return apiRequest(`/appointments/${id}`);
  },
  
  create: async (appointmentData: any) => {
    return apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },
  
  update: async (id: number, appointmentData: any) => {
    return apiRequest(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  },
  
  delete: async (id: number) => {
    return apiRequest(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },
};
