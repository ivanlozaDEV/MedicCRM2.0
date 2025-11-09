# DoctorCRM 2.0

Sistema completo de gestión médica (CRM) con funcionalidades de multi-tenancy, gestión de usuarios, roles, permisos, especialidades médicas y suscripciones. Construido con Flask (backend) y Next.js (frontend).

## 🚀 Stack Tecnológico

### Backend
- **Python**: 3.13.2
- **Framework**: Flask 3.1.0
- **Base de datos**: PostgreSQL 14.19 (database: `doctorcrm2`)
- **Autenticación**: JWT (Flask-JWT-Extended 4.6.0)
- **ORM**: SQLAlchemy (Flask-SQLAlchemy 3.1.1)
- **CORS**: Flask-CORS 5.0.0
- **Migraciones**: Flask-Migrate 4.0.5
- **Puerto**: 5001
- **Arquitectura**: Flask Blueprints (modular)

### Frontend
- **Framework**: Next.js 16.0.1
- **React**: 19.2.0
- **TypeScript**: ^5
- **Estilos**: TailwindCSS ^4
- **Puerto**: 3000
- **API Layer**: TypeScript Services con type-safety

## 📊 Arquitectura de la Base de Datos

### Modelos (8 tablas principales)

1. **Organization** (`backend/models/organization.py`)
   - Multi-tenancy: organizaciones independientes
   - Campos: nombre, slug, configuración, branding, dirección
   - Estados: activo/inactivo

2. **User** (`backend/models/user.py`)
   - Usuarios del sistema con autenticación
   - Campos médicos: `medical_license`, `professional_id`
   - Relación con Organization (muchos-a-uno)
   - Relación con Specialties (muchos-a-muchos vía UserSpecialty)

3. **Subscription** (`backend/models/subscription.py`)
   - Integración con LemonSqueezy
   - Planes: Basic, Professional, Enterprise
   - Control de límites y estados

4. **Role** (`backend/models/role.py`)
   - Sistema de roles con flag `is_system`
   - 5 roles del sistema: Super Admin, Admin, Doctor, Nurse, Receptionist
   - Soporte para roles personalizados creados por admin
   - Relación con Permissions (muchos-a-muchos vía RolePermission)

5. **Permission** (`backend/models/permission.py`)
   - Permisos dinámicos (no hardcoded)
   - Campos: `module_key`, `display_name`, `category`
   - Creados y gestionados por administradores

6. **Specialty** (`backend/models/specialty.py`)
   - Especialidades médicas
   - 10 especialidades por defecto
   - Campos: `default_appointment_duration`, `default_color`

7. **RolePermission** (`backend/models/role_permission.py`)
   - Tabla relacional Role ↔ Permission
   - Asignación de permisos a roles

8. **UserSpecialty** (`backend/models/user_specialty.py`)
   - Tabla relacional User ↔ Specialty
   - Flag `is_primary` para especialidad principal

## 🔌 API REST (60 Endpoints)

### Blueprints Organizados por Módulo

#### 1. Organizations (`/api/organizations`) - 8 endpoints
```
GET    /api/organizations              # Listar organizaciones
GET    /api/organizations/:id          # Obtener por ID
POST   /api/organizations              # Crear organización
PUT    /api/organizations/:id          # Actualizar organización
DELETE /api/organizations/:id          # Eliminar organización
GET    /api/organizations/:id/stats    # Estadísticas de organización
POST   /api/organizations/:id/activate # Activar organización
POST   /api/organizations/:id/deactivate # Desactivar organización
```

#### 2. Users (`/api/users`) - 10 endpoints
```
GET    /api/users                      # Listar usuarios
GET    /api/users/:id                  # Obtener por ID
POST   /api/users                      # Crear usuario
PUT    /api/users/:id                  # Actualizar usuario
DELETE /api/users/:id                  # Eliminar usuario
GET    /api/users/organization/:org_id # Usuarios por organización
POST   /api/users/validate-username    # Validar username único
POST   /api/users/validate-email       # Validar email único
POST   /api/users/:id/reset-password   # Reset contraseña
POST   /api/users/:id/change-password  # Cambiar contraseña
```

#### 3. Subscriptions (`/api/subscriptions`) - 7 endpoints
```
GET    /api/subscriptions              # Listar suscripciones
GET    /api/subscriptions/:id          # Obtener por ID
POST   /api/subscriptions              # Crear suscripción
PUT    /api/subscriptions/:id          # Actualizar suscripción
DELETE /api/subscriptions/:id          # Eliminar suscripción
POST   /api/subscriptions/:id/cancel   # Cancelar suscripción
POST   /api/subscriptions/:id/renew    # Renovar suscripción
```

#### 4. Roles (`/api/roles`) - 6 endpoints
```
GET    /api/roles                      # Listar roles
GET    /api/roles/:id                  # Obtener por ID
POST   /api/roles                      # Crear rol personalizado
PUT    /api/roles/:id                  # Actualizar rol
DELETE /api/roles/:id                  # Eliminar rol (solo custom)
POST   /api/roles/init-system-roles    # Inicializar 5 roles del sistema
```

#### 5. Permissions (`/api/permissions`) - 7 endpoints
```
GET    /api/permissions                # Listar permisos
GET    /api/permissions/:id            # Obtener por ID
POST   /api/permissions                # Crear permiso
PUT    /api/permissions/:id            # Actualizar permiso
DELETE /api/permissions/:id            # Eliminar permiso
GET    /api/permissions/grouped        # Permisos agrupados por categoría
GET    /api/permissions/categories     # Lista de categorías
```

#### 6. Specialties (`/api/specialties`) - 9 endpoints
```
GET    /api/specialties                # Listar especialidades
GET    /api/specialties/:id            # Obtener por ID
POST   /api/specialties                # Crear especialidad
PUT    /api/specialties/:id            # Actualizar especialidad
DELETE /api/specialties/:id            # Eliminar especialidad
GET    /api/specialties/active         # Solo especialidades activas
POST   /api/specialties/:id/activate   # Activar especialidad
POST   /api/specialties/:id/deactivate # Desactivar especialidad
POST   /api/specialties/init-defaults  # Inicializar 10 especialidades
```

#### 7. Role-Permissions (`/api/role-permissions`) - 6 endpoints
```
GET    /api/role-permissions/role/:role_id           # Permisos de un rol
GET    /api/role-permissions/permission/:permission_id # Roles con permiso
POST   /api/role-permissions/assign                   # Asignar permiso a rol
POST   /api/role-permissions/assign-multiple          # Asignar múltiples
POST   /api/role-permissions/replace                  # Reemplazar todos
POST   /api/role-permissions/revoke                   # Revocar permiso
```

#### 8. User-Specialties (`/api/user-specialties`) - 7 endpoints
```
GET    /api/user-specialties/user/:user_id              # Especialidades de usuario
GET    /api/user-specialties/specialty/:specialty_id/users # Usuarios con especialidad
POST   /api/user-specialties/assign                     # Asignar especialidad
POST   /api/user-specialties/assign-multiple            # Asignar múltiples
POST   /api/user-specialties/replace                    # Reemplazar todas
POST   /api/user-specialties/set-primary                # Establecer primaria
POST   /api/user-specialties/revoke                     # Revocar especialidad
```

### Formato de Respuesta Estándar
```typescript
{
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  count?: number; // Para listas
}
```

## 🎨 Frontend - TypeScript Services (8 archivos)

Capa de servicios con type-safety completo en `frontend/lib/services/`:

### Servicios Disponibles

1. **organizationService.ts**
   - Interface: `Organization`, `OrganizationStats`
   - Métodos: CRUD + `getStats()`, `activate()`, `deactivate()`

2. **userService.ts**
   - Interface: `User`, `CreateUserData`
   - Métodos: CRUD + `validateUsername()`, `validateEmail()`, `resetPassword()`

3. **subscriptionService.ts**
   - Interface: `Subscription`
   - Métodos: CRUD + `cancel()`, `renew()`

4. **roleService.ts**
   - Interface: `Role`
   - Métodos: CRUD + `initSystemRoles()`

5. **permissionService.ts**
   - Interface: `Permission`, `PermissionsGrouped`
   - Métodos: CRUD + `getGrouped()`, `getCategories()`

6. **specialtyService.ts**
   - Interface: `Specialty`
   - Métodos: CRUD + `getActive()`, `activate()`, `deactivate()`, `initDefaults()`

7. **rolePermissionService.ts**
   - Interface: `RolePermission`
   - Métodos: `assign()`, `assignMultiple()`, `replace()`, `revoke()`

8. **userSpecialtyService.ts**
   - Interface: `UserSpecialty`
   - Métodos: `assign()`, `assignMultiple()`, `replace()`, `setPrimary()`, `revoke()`

### Uso de Servicios
```typescript
// Importar desde index centralizado
import { userService, roleService } from '@/lib/services';

// Ejemplo: Crear usuario
const newUser = await userService.create({
  username: 'doctor123',
  email: 'doctor@example.com',
  first_name: 'Juan',
  last_name: 'Pérez',
  medical_license: 'MED-12345',
  organization_id: 1
});

// Ejemplo: Inicializar roles del sistema
await roleService.initSystemRoles({ organization_id: 1 });
```

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
│   ├── .venv/                      # Entorno virtual Python
│   ├── models/                     # Modelos de base de datos (8 archivos)
│   │   ├── __init__.py
│   │   ├── organization.py         # Multi-tenancy
│   │   ├── user.py                 # Usuarios con campos médicos
│   │   ├── subscription.py         # LemonSqueezy billing
│   │   ├── role.py                 # Sistema + roles custom
│   │   ├── permission.py           # Permisos dinámicos
│   │   ├── specialty.py            # Especialidades médicas
│   │   ├── role_permission.py      # Relación Role-Permission
│   │   └── user_specialty.py       # Relación User-Specialty
│   ├── routes/                     # Blueprints API (8 archivos)
│   │   ├── __init__.py
│   │   ├── organizations.py        # 8 endpoints
│   │   ├── users.py                # 10 endpoints
│   │   ├── subscriptions.py        # 7 endpoints
│   │   ├── roles.py                # 6 endpoints
│   │   ├── permissions.py          # 7 endpoints
│   │   ├── specialties.py          # 9 endpoints
│   │   ├── role_permissions.py     # 6 endpoints
│   │   └── user_specialties.py     # 7 endpoints
│   ├── app.py                      # Aplicación Flask principal
│   ├── config.py                   # Configuración Flask/DB
│   ├── requirements.txt            # Dependencias Python
│   ├── .env                        # Variables de entorno
│   └── README.md
│
├── frontend/
│   ├── app/                        # App Router Next.js
│   │   ├── page.tsx                # Página principal
│   │   └── layout.tsx
│   ├── lib/                        # Utilidades y servicios
│   │   ├── api.ts                  # Helper apiRequest
│   │   └── services/               # TypeScript Services (8 archivos)
│   │       ├── index.ts            # Export centralizado
│   │       ├── organizationService.ts
│   │       ├── userService.ts
│   │       ├── subscriptionService.ts
│   │       ├── roleService.ts
│   │       ├── permissionService.ts
│   │       ├── specialtyService.ts
│   │       ├── rolePermissionService.ts
│   │       └── userSpecialtyService.ts
│   ├── types/                      # Tipos TypeScript globales
│   ├── public/                     # Archivos estáticos
│   ├── package.json                # Dependencias Node
│   ├── .env.local                  # Variables de entorno
│   ├── tsconfig.json               # Config TypeScript
│   ├── tailwind.config.ts          # Config TailwindCSS
│   └── README.md
│
└── README.md                       # Este archivo
```

## 🌿 Git Workflow y Branches

### Branches Principales

1. **main** - Rama principal (producción)
   - Código estable y listo para deploy
   
2. **models** - Rama de desarrollo backend
   - ✅ 8 modelos de base de datos completos
   - ✅ 60 endpoints API (8 Blueprints)
   - ✅ Arquitectura modular Flask
   - Merge a main cuando esté listo para producción

3. **front1** - Rama de desarrollo frontend (actual)
   - ✅ 8 servicios TypeScript con type-safety
   - ✅ Interfaz completa para los 60 endpoints
   - 🔄 Próximo: Componentes UI y páginas
   - Base para desarrollo de interfaz de usuario

### Comandos Git Útiles

```bash
# Ver rama actual
git branch

# Cambiar de rama
git checkout main
git checkout models
git checkout front1

# Crear nueva rama desde front1
git checkout -b feature/nueva-caracteristica

# Ver estado de cambios
git status

# Ver historial de commits
git log --oneline --graph --all

# Push a GitHub
git push origin front1
```

## 🔑 Datos Importantes del Sistema

### Roles del Sistema (5 predefinidos)
```python
1. Super Admin    # Control total del sistema
2. Admin          # Gestión de organización
3. Doctor         # Profesional médico principal
4. Nurse          # Personal de enfermería
5. Receptionist   # Recepción y citas
```
**Inicializar con:** `POST /api/roles/init-system-roles`

### Especialidades Médicas (10 por defecto)
```python
1. Medicina General (30 min, #3B82F6)
2. Pediatría (30 min, #10B981)
3. Cardiología (45 min, #EF4444)
4. Dermatología (30 min, #F59E0B)
5. Ginecología (30 min, #EC4899)
6. Oftalmología (30 min, #8B5CF6)
7. Traumatología (45 min, #6366F1)
8. Psicología (60 min, #14B8A6)
9. Odontología (30 min, #06B6D4)
10. Nutrición (45 min, #84CC16)
```
**Inicializar con:** `POST /api/specialties/init-defaults`

### Configuración de Base de Datos
```
Host: localhost
Port: 5432
Database: doctorcrm2
User: postgres
Password: postgres
```

### Puertos de Aplicación
```
Backend API:  http://localhost:5001/api
Frontend:     http://localhost:3000
Health Check: http://localhost:5001/api/health
```

## 🧪 Probar la API

### Inicialización del Sistema

```bash
# 1. Health check
curl http://localhost:5001/api/health

# 2. Crear organización
curl -X POST http://localhost:5001/api/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Clínica Ejemplo",
    "slug": "clinica-ejemplo",
    "email": "contacto@clinicaejemplo.com",
    "phone": "+34123456789"
  }'

# 3. Inicializar roles del sistema (necesitas organization_id del paso anterior)
curl -X POST http://localhost:5001/api/roles/init-system-roles \
  -H "Content-Type: application/json" \
  -d '{"organization_id": 1}'

# 4. Inicializar especialidades médicas
curl -X POST http://localhost:5001/api/specialties/init-defaults \
  -H "Content-Type: application/json" \
  -d '{}'

# 5. Crear usuario administrador
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@clinica.com",
    "password": "Admin123!",
    "first_name": "Administrador",
    "last_name": "Sistema",
    "organization_id": 1,
    "role_id": 1
  }'
```

### Ejemplos de Uso de la API

```bash
# Listar todas las organizaciones
curl http://localhost:5001/api/organizations

# Obtener estadísticas de organización
curl http://localhost:5001/api/organizations/1/stats

# Listar usuarios de una organización
curl http://localhost:5001/api/users/organization/1

# Obtener permisos agrupados por categoría
curl http://localhost:5001/api/permissions/grouped

# Asignar especialidad a un usuario
curl -X POST http://localhost:5001/api/user-specialties/assign \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "specialty_id": 1,
    "is_primary": true
  }'

# Asignar múltiples permisos a un rol
curl -X POST http://localhost:5001/api/role-permissions/assign-multiple \
  -H "Content-Type: application/json" \
  -d '{
    "role_id": 3,
    "permission_ids": [1, 2, 3, 4],
    "assigned_by": 1
  }'
```

### Desde el Frontend (TypeScript)

```typescript
import { 
  organizationService, 
  roleService, 
  specialtyService,
  userService 
} from '@/lib/services';

// Crear organización
const org = await organizationService.create({
  name: 'Mi Clínica',
  slug: 'mi-clinica',
  email: 'info@miclinica.com'
});

// Inicializar sistema
await roleService.initSystemRoles({ organization_id: org.data.id });
await specialtyService.initDefaults();

// Crear usuario doctor
const doctor = await userService.create({
  username: 'dr.smith',
  email: 'smith@miclinica.com',
  first_name: 'John',
  last_name: 'Smith',
  medical_license: 'MED-12345',
  organization_id: org.data.id,
  role_id: 3 // Doctor role
});

// Asignar especialidad
await userSpecialtyService.assign({
  user_id: doctor.data.id,
  specialty_id: 1, // Medicina General
  is_primary: true
});
```

## 📦 Modelos de Datos Detallados

### Organization (Organización)
```typescript
{
  id: number;
  name: string;
  slug: string;                    // URL-friendly identifier
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  logo_url?: string;               // Branding
  primary_color?: string;          // Branding
  secondary_color?: string;        // Branding
  website?: string;
  is_active: boolean;
  settings?: object;               // JSON config
  created_at: datetime;
  updated_at: datetime;
}
```

### User (Usuario)
```typescript
{
  id: number;
  username: string;                // Único
  email: string;                   // Único
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: date;
  avatar_url?: string;
  medical_license?: string;        // Campo médico
  professional_id?: string;        // Campo médico
  is_active: boolean;
  organization_id: number;         // FK Organization
  role_id?: number;                // FK Role
  created_at: datetime;
  updated_at: datetime;
  last_login?: datetime;
}
```

### Subscription (Suscripción)
```typescript
{
  id: number;
  organization_id: number;         // FK Organization
  plan: 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  lemon_squeezy_id?: string;
  start_date: date;
  end_date?: date;
  max_users?: number;              // Límite del plan
  max_patients?: number;           // Límite del plan
  max_appointments_per_month?: number;
  is_trial: boolean;
  trial_end_date?: date;
  created_at: datetime;
  updated_at: datetime;
}
```

### Role (Rol)
```typescript
{
  id: number;
  name: string;
  description?: string;
  is_system: boolean;              // true = rol predefinido, false = custom
  organization_id: number;         // FK Organization
  created_at: datetime;
  updated_at: datetime;
}
```

### Permission (Permiso)
```typescript
{
  id: number;
  module_key: string;              // Ej: 'users.create', 'appointments.view'
  display_name: string;
  description?: string;
  category?: string;               // Ej: 'Users', 'Appointments', 'Reports'
  created_at: datetime;
  updated_at: datetime;
}
```

### Specialty (Especialidad)
```typescript
{
  id: number;
  name: string;
  description?: string;
  default_appointment_duration: number;  // En minutos
  default_color?: string;                // HEX color para UI
  is_active: boolean;
  created_at: datetime;
  updated_at: datetime;
}
```

### RolePermission (Relación Rol-Permiso)
```typescript
{
  role_id: number;                 // FK Role
  permission_id: number;           // FK Permission
  assigned_by?: number;            // FK User (quien asignó)
  assigned_at: datetime;
}
```

### UserSpecialty (Relación Usuario-Especialidad)
```typescript
{
  user_id: number;                 // FK User
  specialty_id: number;            // FK Specialty
  is_primary: boolean;             // Especialidad principal
  assigned_by?: number;            // FK User (quien asignó)
  assigned_at: datetime;
}
```

## 🛠️ Desarrollo

### Backend (Flask)

```bash
# Activar entorno virtual
cd backend
source .venv/bin/activate

# Ejecutar en modo desarrollo
python app.py

# Ejecutar con auto-reload (desarrollo)
FLASK_DEBUG=1 python app.py

# Ver logs en tiempo real
tail -f logs/app.log  # Si implementas logging

# Desactivar entorno virtual
deactivate
```

**Comandos útiles de base de datos:**
```bash
# Conectar a PostgreSQL
psql -U postgres -d doctorcrm2

# Ver tablas
\dt

# Describir tabla
\d organizations
\d users

# Ver datos
SELECT * FROM organizations;
SELECT * FROM users LIMIT 5;

# Salir
\q
```

### Frontend (Next.js)

```bash
cd frontend

# Modo desarrollo (con hot-reload)
npm run dev

# Build para producción
npm run build

# Ejecutar build de producción
npm start

# Linting y verificación de tipos
npm run lint
npx tsc --noEmit

# Formatear código (si usas Prettier)
npx prettier --write .
```

### Agregar Nuevos Modelos/Endpoints

#### 1. Crear nuevo modelo (backend)
```bash
# Crear archivo en backend/models/nuevo_modelo.py
# Seguir patrón de los modelos existentes
# Agregar import en backend/models/__init__.py
```

#### 2. Crear nuevas rutas (backend)
```bash
# Crear archivo en backend/routes/nuevo_modelo.py
# Seguir patrón Blueprint existente
# Registrar Blueprint en backend/app.py
```

#### 3. Crear servicio frontend
```bash
# Crear archivo en frontend/lib/services/nuevoModeloService.ts
# Seguir patrón de servicios existentes
# Exportar desde frontend/lib/services/index.ts
```

### Testing (Próximamente)

```bash
# Backend - pytest
cd backend
pip install pytest pytest-flask
pytest tests/

# Frontend - Jest
cd frontend
npm install --save-dev jest @testing-library/react
npm test
```

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL

**Problema:** `could not connect to server: Connection refused`

**Soluciones:**
```bash
# 1. Verificar que PostgreSQL esté ejecutándose
pg_isready
# o
brew services list | grep postgresql  # macOS con Homebrew

# 2. Iniciar PostgreSQL si está detenido
brew services start postgresql@14     # macOS
sudo systemctl start postgresql       # Linux

# 3. Verificar configuración de conexión
psql -U postgres -d doctorcrm2

# 4. Verificar variables de entorno en backend/.env
cat backend/.env | grep DB_
```

### Error: "Database does not exist"

```bash
# Crear la base de datos
psql -U postgres
CREATE DATABASE doctorcrm2;
\q
```

### Puerto en uso

**Backend (5001 ocupado):**
```bash
# Encontrar proceso usando el puerto
lsof -i :5001

# Matar el proceso (reemplaza PID)
kill -9 <PID>

# O cambiar puerto en backend/.env
FLASK_PORT=5002
```

**Frontend (3000 ocupado):**
```bash
# Usar otro puerto
npm run dev -- -p 3001

# O matar proceso en puerto 3000
lsof -i :3000
kill -9 <PID>
```

### Módulos Python no encontrados

```bash
cd backend
source .venv/bin/activate

# Reinstalar dependencias
pip install -r requirements.txt

# Verificar instalación
pip list
```

### Errores de TypeScript en Frontend

```bash
cd frontend

# Reinstalar node_modules
rm -rf node_modules package-lock.json
npm install

# Verificar tipos
npx tsc --noEmit

# Limpiar caché Next.js
rm -rf .next
npm run dev
```

### Error: "CORS policy blocked"

**Problema:** Frontend no puede acceder al backend

**Solución:** Verificar en `backend/app.py`:
```python
CORS(app, origins=["http://localhost:3000"])
```

Si frontend corre en otro puerto, actualizar el origen.

### Migraciones de Base de Datos

```bash
cd backend
source .venv/bin/activate

# Si usas Flask-Migrate
flask db init          # Primera vez
flask db migrate -m "Descripción del cambio"
flask db upgrade

# Si necesitas recrear tablas (CUIDADO: borra datos)
# En psql:
DROP DATABASE doctorcrm2;
CREATE DATABASE doctorcrm2;
# Luego ejecutar app.py para crear tablas
```

### Variables de Entorno no Reconocidas

```bash
# Backend - verificar archivo existe
ls -la backend/.env

# Frontend - debe ser .env.local
ls -la frontend/.env.local

# Reiniciar servidores después de cambiar .env
```

## 🎯 Próximos Pasos / Roadmap

### Fase 1: Backend ✅ COMPLETADO
- [x] Configuración inicial Flask
- [x] Modelos de base de datos (8 modelos)
- [x] Sistema de roles y permisos
- [x] Especialidades médicas
- [x] API REST completa (60 endpoints)
- [x] Arquitectura modular (Blueprints)

### Fase 2: Frontend Services ✅ COMPLETADO
- [x] Configuración Next.js + TypeScript
- [x] Servicios API con type-safety (8 servicios)
- [x] Integración con backend
- [x] Interfaces TypeScript

### Fase 3: UI Components 🔄 EN PROGRESO
- [ ] Sistema de autenticación (Login/Register)
- [ ] Dashboard principal
- [ ] Gestión de organizaciones
- [ ] Gestión de usuarios
- [ ] Gestión de roles y permisos
- [ ] Gestión de especialidades
- [ ] Perfil de usuario

### Fase 4: Funcionalidades Médicas 📋 PENDIENTE
- [ ] Gestión de pacientes
- [ ] Sistema de citas
- [ ] Calendario médico
- [ ] Historial médico
- [ ] Recetas y prescripciones
- [ ] Reportes y estadísticas

### Fase 5: Avanzado 📋 PENDIENTE
- [ ] Sistema de notificaciones
- [ ] Chat en tiempo real
- [ ] Telemedicina (videollamadas)
- [ ] Integración con sistemas de pago
- [ ] App móvil (React Native)
- [ ] Panel de analíticas

### Fase 6: Deployment 📋 PENDIENTE
- [ ] Dockerización
- [ ] CI/CD (GitHub Actions)
- [ ] Deploy backend (Railway/Heroku)
- [ ] Deploy frontend (Vercel)
- [ ] Configuración de dominio
- [ ] SSL/HTTPS
- [ ] Backups automáticos

## 📝 Notas Importantes

### Seguridad
1. **Claves secretas**: Las siguientes variables en `backend/.env` DEBEN cambiarse en producción:
   ```env
   SECRET_KEY=tu-clave-super-secreta-de-produccion
   JWT_SECRET_KEY=tu-jwt-secret-key-de-produccion
   ```

2. **Contraseñas**: Implementar políticas de contraseñas fuertes
   - Mínimo 8 caracteres
   - Incluir mayúsculas, minúsculas, números y símbolos

3. **CORS**: En producción, configurar orígenes específicos:
   ```python
   CORS(app, origins=["https://tu-dominio.com"])
   ```

### Base de Datos
1. PostgreSQL debe estar ejecutándose antes de iniciar el backend
2. La base de datos `doctorcrm2` debe existir
3. Las credenciales en `.env` deben coincidir con tu configuración local
4. En producción, usar URLs de conexión seguras

### JWT y Autenticación
- Los tokens de acceso expiran (configurar en `config.py`)
- Implementar refresh tokens para sesiones prolongadas
- Usar HTTPS en producción para proteger tokens

### Multi-tenancy
- Cada organización es independiente
- Los usuarios pertenecen a una sola organización
- Los roles son específicos por organización
- Verificar `organization_id` en todas las queries

### Roles y Permisos
- **Roles del sistema** (is_system=true): No pueden ser eliminados ni renombrados
- **Roles custom** (is_system=false): Creados por admins, pueden modificarse
- Verificar permisos antes de ejecutar acciones críticas

### Especialidades
- Un usuario puede tener múltiples especialidades
- Solo una especialidad puede ser `is_primary=true`
- Las especialidades tienen duración y color por defecto para UI

## 📚 Recursos y Referencias

### Documentación Oficial
- [Flask 3.1.0](https://flask.palletsprojects.com/)
- [Next.js 16](https://nextjs.org/docs)
- [PostgreSQL 14](https://www.postgresql.org/docs/14/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [TailwindCSS 4](https://tailwindcss.com/docs)

### Patrones y Arquitectura
- **Backend**: Flask Blueprints (modular architecture)
- **Frontend**: Next.js App Router + TypeScript Services
- **Base de datos**: Relational model con many-to-many relationships
- **API**: RESTful con respuestas JSON estandarizadas

### Stack Integrado
```
┌─────────────────────────────────────┐
│   Frontend (Next.js + TypeScript)   │
│   Port: 3000                        │
│   - React Components                │
│   - TypeScript Services (8 files)   │
│   - TailwindCSS Styling             │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
               │
┌──────────────▼──────────────────────┐
│   Backend (Flask + Python)          │
│   Port: 5001                        │
│   - Flask Blueprints (8 modules)    │
│   - SQLAlchemy ORM                  │
│   - JWT Authentication              │
└──────────────┬──────────────────────┘
               │ SQL Queries
               │
┌──────────────▼──────────────────────┐
│   Database (PostgreSQL)             │
│   Port: 5432                        │
│   - 8 Models + Relationships        │
│   - Multi-tenant Architecture       │
└─────────────────────────────────────┘
```

## 🤝 Contribuir

### Guidelines

1. **Fork y Clone**
   ```bash
   git clone https://github.com/ivanlozaDEV/MedicCRM2.0.git
   cd MedicCRM2.0
   ```

2. **Crear Feature Branch**
   ```bash
   git checkout -b feature/nueva-caracteristica
   ```

3. **Código**
   - Seguir patrones existentes
   - Comentar código complejo
   - TypeScript types para todo
   - Documentar endpoints nuevos

4. **Commits**
   ```bash
   git commit -m "feat: descripción clara del feature"
   git commit -m "fix: descripción del bug solucionado"
   git commit -m "docs: actualización de documentación"
   ```

5. **Push y Pull Request**
   ```bash
   git push origin feature/nueva-caracteristica
   # Luego crear PR en GitHub
   ```

### Convenciones de Código

**Python (Backend):**
- PEP 8 style guide
- Snake_case para variables y funciones
- Docstrings para funciones públicas

**TypeScript (Frontend):**
- ESLint + Prettier
- camelCase para variables y funciones
- PascalCase para componentes React
- Interfaces para todos los tipos

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 👨‍💻 Autor y Contacto

**DoctorCRM 2.0** - Sistema de Gestión Médica

Desarrollado por: ivanlozaDEV  
Repositorio: [github.com/ivanlozaDEV/MedicCRM2.0](https://github.com/ivanlozaDEV/MedicCRM2.0)

---

## 🎉 Estado Actual del Proyecto

### ✅ Completado (60% del proyecto)
- ✅ Arquitectura backend completa
- ✅ 8 modelos de base de datos
- ✅ 60 endpoints API REST
- ✅ Sistema de roles y permisos
- ✅ Especialidades médicas
- ✅ Servicios TypeScript frontend
- ✅ Type-safety completo

### 🔄 En Progreso (20%)
- 🔄 Componentes UI React
- 🔄 Sistema de autenticación frontend
- 🔄 Dashboard y navegación

### 📋 Próximamente (20%)
- 📋 Gestión de pacientes
- 📋 Sistema de citas
- 📋 Calendario médico
- 📋 Deployment

---

**¡Listo para desarrollar!** 🚀

Para iniciar el desarrollo:
```bash
# Terminal 1 - Backend
cd backend && source .venv/bin/activate && python app.py

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

Luego abre `http://localhost:3000` en tu navegador.

Para cualquier duda, consulta:
- Este README completo
- Código comentado en `backend/` y `frontend/`
- Issues en GitHub
