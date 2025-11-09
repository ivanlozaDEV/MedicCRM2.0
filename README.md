# DoctorCRM 2.0

Sistema de gestión de pacientes y citas médicas construido con Flask y Next.js.

## 🚀 Tecnologías

### Backend
- **Python**: 3.13.2
- **Framework**: Flask 3.1.0
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT (Flask-JWT-Extended 4.6.0)
- **ORM**: SQLAlchemy (Flask-SQLAlchemy 3.1.1)
- **Puerto**: 5001

### Frontend
- **Framework**: Next.js 16.0.1
- **React**: 19.2.0
- **TypeScript**: ^5
- **Estilos**: TailwindCSS ^4
- **Puerto**: 3000

## 📋 Requisitos Previos

1. **Python 3.13.2** instalado
2. **Node.js 18+** instalado
3. **PostgreSQL** instalado y ejecutándose
4. **Git** (opcional, para control de versiones)

## 🔧 Configuración Inicial

### 1. Configurar Base de Datos PostgreSQL

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE doctorcrm2;

# Verificar creación
\l

# Salir
\q
```

### 2. Configurar Backend (Flask)

```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual
python3 -m venv .venv

# Activar entorno virtual
source .venv/bin/activate  # En macOS/Linux
# .venv\Scripts\activate   # En Windows

# Instalar dependencias
pip install -r requirements.txt

# Verificar instalación
pip list
```

**Configuración de variables de entorno:**
El archivo `.env` ya está configurado en `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/doctorcrm
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doctorcrm
DB_USER=postgres
DB_PASSWORD=postgres
FLASK_PORT=5001
```

**⚠️ IMPORTANTE**: Cambia las claves secretas en producción:
- `SECRET_KEY`
- `JWT_SECRET_KEY`

### 3. Configurar Frontend (Next.js)

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias (si aún no lo has hecho)
npm install

# Verificar instalación
npm list --depth=0
```

**Configuración de variables de entorno:**
El archivo `.env.local` ya está configurado en `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## 🚀 Ejecutar la Aplicación

### Opción 1: Ejecutar Backend y Frontend por separado

#### Terminal 1 - Backend:
```bash
cd backend
source .venv/bin/activate
python app.py
```

La API estará disponible en: `http://localhost:5001/api`

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

La aplicación web estará disponible en: `http://localhost:3000`

### Opción 2: Script rápido (macOS/Linux)

Crea un archivo `start.sh` en la raíz del proyecto:

```bash
#!/bin/bash

# Iniciar Backend
cd backend
source .venv/bin/activate
python app.py &
BACKEND_PID=$!

# Iniciar Frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend corriendo en http://localhost:5001 (PID: $BACKEND_PID)"
echo "Frontend corriendo en http://localhost:3000 (PID: $FRONTEND_PID)"
echo "Presiona Ctrl+C para detener ambos servidores"

# Esperar y limpiar al salir
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
```

Luego ejecuta:
```bash
chmod +x start.sh
./start.sh
```

## 📚 Estructura del Proyecto

```
DoctorCRM2.0/
├── backend/
│   ├── .venv/              # Entorno virtual Python
│   ├── app.py              # Aplicación principal Flask
│   ├── models.py           # Modelos de base de datos
│   ├── config.py           # Configuración de Flask
│   ├── requirements.txt    # Dependencias Python
│   ├── .env                # Variables de entorno
│   └── README.md           # Documentación backend
│
├── frontend/
│   ├── app/                # Páginas Next.js
│   ├── lib/                # Utilidades y API
│   ├── types/              # Tipos TypeScript
│   ├── public/             # Archivos estáticos
│   ├── package.json        # Dependencias Node
│   ├── .env.local          # Variables de entorno
│   └── README.md           # Documentación frontend
│
└── README.md               # Este archivo
```

## 🔑 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Pacientes
- `GET /api/patients` - Listar todos los pacientes
- `GET /api/patients/:id` - Obtener un paciente
- `POST /api/patients` - Crear paciente
- `PUT /api/patients/:id` - Actualizar paciente
- `DELETE /api/patients/:id` - Eliminar paciente

### Citas
- `GET /api/appointments` - Listar todas las citas
- `GET /api/appointments/:id` - Obtener una cita
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Eliminar cita

### Health Check
- `GET /api/health` - Verificar estado de la API

## 🧪 Probar la API

### Con curl:

```bash
# Health check
curl http://localhost:5001/api/health

# Registrar usuario
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"password123","role":"admin"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### Con la interfaz web:

1. Abre `http://localhost:3000` en tu navegador
2. Explora las diferentes secciones
3. Usa las credenciales creadas para iniciar sesión

## 📦 Modelos de Datos

### User (Usuario)
```typescript
{
  id: number
  username: string
  email: string
  password_hash: string
  role: string
  created_at: datetime
  updated_at: datetime
}
```

### Patient (Paciente)
```typescript
{
  id: number
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth?: date
  address?: string
  medical_history?: string
  created_at: datetime
  updated_at: datetime
}
```

### Appointment (Cita)
```typescript
{
  id: number
  patient_id: number
  doctor_name: string
  appointment_date: datetime
  duration_minutes: number
  status: string
  notes?: string
  created_at: datetime
  updated_at: datetime
}
```

## 🛠️ Desarrollo

### Backend

```bash
# Activar entorno virtual
cd backend
source .venv/bin/activate

# Ejecutar en modo desarrollo
python app.py

# Desactivar entorno virtual
deactivate
```

### Frontend

```bash
cd frontend

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar producción
npm start

# Linting
npm run lint
```

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL esté ejecutándose: `pg_isready`
- Verifica las credenciales en `backend/.env`
- Asegúrate de que la base de datos `doctorcrm` existe

### Puerto en uso
- Backend: Cambia `FLASK_PORT` en `backend/.env`
- Frontend: Usa `npm run dev -- -p 3001` para cambiar el puerto

### Dependencias faltantes
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

## 📝 Notas Importantes

1. **Seguridad**: Las claves secretas en `.env` deben cambiarse en producción
2. **Base de datos**: Asegúrate de que PostgreSQL esté ejecutándose antes de iniciar el backend
3. **CORS**: El backend está configurado para aceptar solicitudes desde `http://localhost:3000`
4. **JWT**: Los tokens de acceso expiran después de 1 hora

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

DoctorCRM 2.0 - Sistema de gestión médica

---

**¡Listo para usar!** 🎉

Para cualquier duda o problema, consulta la documentación específica en:
- `backend/README.md` - Documentación del backend
- `frontend/README.md` - Documentación del frontend
