#!/bin/bash

echo "🚀 Iniciando DoctorCRM 2.0..."
echo ""

# Verificar si PostgreSQL está corriendo
if ! pg_isready -q; then
    echo "❌ PostgreSQL no está ejecutándose"
    echo "Por favor, inicia PostgreSQL antes de continuar"
    exit 1
fi

echo "✅ PostgreSQL está ejecutándose"

# Verificar si la base de datos existe
if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw doctorcrm; then
    echo "⚠️  La base de datos 'doctorcrm' no existe"
    echo "Creando base de datos..."
    createdb -U postgres doctorcrm
    echo "✅ Base de datos creada"
fi

# Iniciar Backend
echo ""
echo "📦 Iniciando Backend (Flask)..."
cd backend
source .venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Esperar a que el backend se inicie
sleep 3

# Iniciar Frontend
echo ""
echo "🎨 Iniciando Frontend (Next.js)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Aplicación iniciada correctamente!"
echo ""
echo "📍 URLs:"
echo "   Backend API: http://localhost:5001/api"
echo "   Frontend:    http://localhost:3000"
echo ""
echo "📋 PIDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "⚠️  Presiona Ctrl+C para detener ambos servidores"
echo ""

# Función para limpiar al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servidores detenidos"
    exit 0
}

# Capturar señal de interrupción
trap cleanup SIGINT SIGTERM

# Esperar indefinidamente
wait
