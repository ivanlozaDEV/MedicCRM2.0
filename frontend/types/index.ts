export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  medical_history?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_name: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
