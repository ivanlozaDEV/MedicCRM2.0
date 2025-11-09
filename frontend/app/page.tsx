'use client';

import Link from "next/link";
import { useEffect, useState } from 'react';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [backendMessage, setBackendMessage] = useState<string>('Verificando...');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setBackendStatus('connected');
          setBackendMessage(data.message || 'Backend conectado correctamente');
        } else {
          setBackendStatus('error');
          setBackendMessage('Backend respondió con error');
        }
      } catch (error) {
        setBackendStatus('error');
        setBackendMessage('No se puede conectar al backend');
      }
    };

    checkBackend();
    // Verificar cada 10 segundos
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center px-8 py-16">
        <div className="text-center space-y-8">
          {/* Indicador de estado del backend */}
          <div className="mb-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              backendStatus === 'connected' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : backendStatus === 'error'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              <span className={`h-2 w-2 rounded-full ${
                backendStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                backendStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`}></span>
              {backendStatus === 'connected' && '✅ Backend Conectado'}
              {backendStatus === 'error' && '❌ Backend Desconectado'}
              {backendStatus === 'checking' && '🔄 Verificando...'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {backendMessage}
            </p>
          </div>

          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            DoctorCRM 2.0
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Sistema de gestión de pacientes y citas médicas
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/patients"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Ver Pacientes
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Gestión de Pacientes
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Administra la información de tus pacientes de manera eficiente y segura.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Control de Citas
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Programa y administra citas médicas con facilidad.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Historial Médico
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Mantén un registro completo del historial médico de cada paciente.
              </p>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
            <p>Backend: Flask 3.1.0 | Frontend: Next.js 16.0.1 | Database: PostgreSQL</p>
          </div>
        </div>
      </main>
    </div>
  );
}
