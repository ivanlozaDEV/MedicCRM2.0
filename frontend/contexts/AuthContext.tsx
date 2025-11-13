'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import type { User } from '@/lib/services/userService';
import type { Organization } from '@/lib/services/organizationService';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  permissions: string[];
  roles: any[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    organization_name: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Load user on mount (check if already logged in)
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authService.getCurrentUser();
      
      if (response.success) {
        setUser(response.data.user);
        setOrganization(response.data.organization);
        setPermissions(response.data.permissions || []);
        setRoles(response.data.roles || []);
      } else {
        // Token inválido, limpiar
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.success) {
        // Guardar token si viene en la respuesta
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        }
        
        // Cargar datos completos del usuario
        const userData = await authService.getCurrentUser();
        
        if (userData.success) {
          setUser(userData.data.user);
          setOrganization(userData.data.organization);
          setPermissions(userData.data.permissions || []);
          setRoles(userData.data.roles || []);
          
          const orgSlug = userData.data?.organization?.slug;
          
          // Redirigir al dashboard con el slug de la organización
          if (orgSlug) {
            router.push(`/${orgSlug}/dashboard`);
          } else {
            console.error('No organization slug found');
            router.push('/login');
          }
        } else {
          throw new Error('Error al cargar datos del usuario');
        }
      } else {
        throw new Error(response.message || 'Error en el inicio de sesión');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    organization_name: string;
  }) => {
    try {
      const response = await authService.signup(data);
      
      if (response.success) {
        // Guardar token si viene en la respuesta
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        }
        
        // Cargar datos completos del usuario
        const userData = await authService.getCurrentUser();
        
        if (userData.success) {
          setUser(userData.data.user);
          setOrganization(userData.data.organization);
          setPermissions(userData.data.permissions || []);
          setRoles(userData.data.roles || []);
          
          const orgSlug = userData.data?.organization?.slug;
          
          // Redirigir al dashboard con el slug de la organización
          if (orgSlug) {
            router.push(`/${orgSlug}/dashboard`);
          } else {
            console.error('No organization slug found');
            router.push('/login');
          }
        } else {
          throw new Error('Error al cargar datos del usuario');
        }
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar estado local
      localStorage.removeItem('auth_token');
      setUser(null);
      setOrganization(null);
      setPermissions([]);
      setRoles([]);
      
      // Redirigir al login
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const value: AuthContextType = {
    user,
    organization,
    permissions,
    roles,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
