# DoctorCRM 2.0 🏥

Sistema completo de gestión médica (CRM/EHR) con funcionalidades de multi-tenancy, gestión de usuarios, roles, permisos, especialidades médicas, pacientes, historias clínicas y suscripciones. Construido con **Flask** (backend) y **Next.js** (frontend) siguiendo estándares **FHIR R4**.

## 🚀 Stack Tecnológico

### Backend
- **Python**: 3.13.2
- **Framework**: Flask 3.1.0
- **Base de datos**: PostgreSQL 14.19 (database: `doctorcrm2.0`)
- **Autenticación**: JWT (Flask-JWT-Extended 4.6.0)
- **ORM**: SQLAlchemy (Flask-SQLAlchemy 3.1.1)
- **CORS**: Flask-CORS 5.0.0
- **Migraciones**: Flask-Migrate 4.0.5
- **Puerto**: 5001
- **Arquitectura**: Flask Blueprints (modular)
- **Estándares**: FHIR R4 para datos clínicos

### Frontend
- **Framework**: Next.js 16.0.1 (App Router)
- **React**: 19.2.0
- **TypeScript**: ^5
- **Estilos**: TailwindCSS ^4
- **Iconos**: Heroicons
- **Puerto**: 3000
- **API Layer**: TypeScript Services con type-safety
- **Autenticación**: Context API + JWT
- **Permisos**: Sistema granular con guards

## 📊 Arquitectura de la Base de Datos

### Modelos Core (8 tablas)

1. **Organization** (`backend/models/organization.py`)
   - Multi-tenancy: organizaciones independientes
   - Campos: nombre, slug, configuración, branding, dirección, `color_palette`
   - Estados: activo/inactivo
   - Paletas de color: 12 opciones predefinidas

2. **User** (`backend/models/user.py`)
   - Usuarios del sistema con autenticación
   - Campos médicos: `medical_license`, `professional_id`
   - Relación con Organization (muchos-a-uno)
   - Relación con Specialties (muchos-a-muchos vía UserSpecialty)

3. **Subscription** (`backend/models/subscription.py`)
   - Integración con LemonSqueezy
   - Planes: Basic, Professional, Enterprise
   - Control de límites y estados (active, cancelled, expired)
   - Webhooks para sincronización automática

4. **Role** (`backend/models/role.py`)
   - Sistema de roles con flag `is_system`
   - 5 roles del sistema: Super Admin, Admin, Doctor, Nurse, Receptionist
   - Soporte para roles personalizados creados por admin
   - Relación con Permissions (muchos-a-muchos vía RolePermission)

5. **Permission** (`backend/models/permission.py`)
   - **120 permisos** dinámicos (no hardcoded)
   - Campos: `module_key`, `display_name`, `category`
   - 19 categorías: users, roles, permissions, specialties, patients, allergies, medications, etc.
   - Creados automáticamente con `seed_permissions.py`

6. **Specialty** (`backend/models/specialty.py`)
   - **39 especialidades médicas** con iconos
   - Campos: `default_appointment_duration`, `default_color`, `icon`
   - Especialidades: Cardiología, Pediatría, Dermatología, etc.
   - Creadas automáticamente con `seed_default_specialties.py`

7. **RolePermission** (`backend/models/role_permission.py`)
   - Tabla relacional Role ↔ Permission
   - Asignación de permisos a roles

8. **UserSpecialty** (`backend/models/user_specialty.py`)
   - Tabla relacional User ↔ Specialty
   - Flag `is_primary` para especialidad principal

### Modelos Clínicos FHIR (10 tablas)

9. **Patient** (`backend/models/patient.py`)
   - **Cumple FHIR R4 Patient Resource**
   - Identificadores: MRN (Medical Record Number), SSN, License
   - Campos: nombres, género, fecha nacimiento, contacto
   - Relación con Organization
   - Soporte para múltiples direcciones y telecomunicaciones

10. **PatientContact** (`backend/models/patient_contact.py`)
    - **Cumple FHIR R4 RelatedPerson**
    - Contactos de emergencia del paciente
    - Relaciones: Emergency Contact, Parent, Spouse, Guardian, etc.
    - Campos: nombre, relación, teléfonos, dirección

11. **Allergy** (`backend/models/allergy.py`)
    - **Catálogo global de alergenos**
    - **22 alergias** precargadas (medicamentos, alimentos, ambientales)
    - Códigos SNOMED CT
    - Categorías: medication, food, environment, biologic
    - Severidad: mild, moderate, severe
    - Creadas con `seed_allergies.py`

12. **PatientAllergy** (`backend/models/patient_allergy.py`)
    - **Cumple FHIR R4 AllergyIntolerance**
    - Registro de alergias del paciente
    - FK opcional a catálogo `Allergy`
    - Permite alergias personalizadas (no en catálogo)
    - Campos: allergen, reacciones, severidad, onset_date, notas

13. **Medication** (`backend/models/medication.py`)
    - **Catálogo global de medicamentos**
    - **22 medicamentos** precargados
    - Códigos estándar: RxNorm, NDC, ATC
    - 11 categorías: antibiotic, analgesic, antihypertensive, etc.
    - Información típica: dosis, vías, frecuencias
    - `controlled_substance` (Schedule I-V)
    - Creados con `seed_medications.py`

14. **PatientMedication** (`backend/models/patient_medication.py`)
    - **Cumple FHIR R4 MedicationStatement**
    - Registro de medicamentos del paciente
    - FK opcional a catálogo `Medication`
    - Permite medicamentos personalizados
    - Estados: active, completed, stopped, on-hold
    - Campos: dosage, route, frequency, prescriber, pharmacy, refills
    - Flag `is_prn` (PRN - según necesidad)

15. **PatientCondition** (`backend/models/patient_condition.py`)
    - **Cumple FHIR R4 Condition**
    - Condiciones médicas/diagnósticos del paciente
    - Códigos ICD-10/SNOMED CT
    - Estados: active, recurrence, relapse, inactive, remission, resolved
    - Severidad: mild, moderate, severe
    - Campos: onset, abatement, stage, evidence

### Relaciones Clave

```
Organization
  ├─── Users (1:N)
  ├─── Patients (1:N)
  └─── Subscription (1:1)

User
  ├─── UserRoles (N:M via user_role)
  └─── UserSpecialties (N:M via user_specialty)

Role
  └─── RolePermissions (N:M via role_permission)

Patient
  ├─── PatientContacts (1:N)
  ├─── PatientAllergies (1:N)
  ├─── PatientMedications (1:N)
  └─── PatientConditions (1:N)

Allergy (Catalog)
  └─── PatientAllergies (1:N, optional)

Medication (Catalog)
  └─── PatientMedications (1:N, optional)
```

## 🔌 API REST (100+ Endpoints)

### Blueprints Organizados por Módulo


#### 1. **Auth** (`/api/auth`) - 3 endpoints
```
POST   /api/auth/register              # Registro de usuario
POST   /api/auth/login                 # Login con JWT
POST   /api/auth/me                    # Obtener usuario actual (protegido)
```

#### 2. **Organizations** (`/api/organizations`) - 8 endpoints
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

#### 3. **Users** (`/api/users`) - 10 endpoints
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


#### 4. **Subscriptions** (`/api/subscriptions`) - 7 endpoints
```
GET    /api/subscriptions              # Listar suscripciones
GET    /api/subscriptions/:id          # Obtener por ID
POST   /api/subscriptions              # Crear suscripción
PUT    /api/subscriptions/:id          # Actualizar suscripción
DELETE /api/subscriptions/:id          # Eliminar suscripción
POST   /api/subscriptions/:id/cancel   # Cancelar suscripción
POST   /api/subscriptions/:id/renew    # Renovar suscripción
```

#### 5. **Webhooks** (`/api/webhooks`) - 1 endpoint
```
POST   /api/webhooks/lemonsqueezy      # Webhook LemonSqueezy (signature validation)
```

#### 6. **Roles** (`/api/roles`) - 6 endpoints
```
GET    /api/roles                      # Listar roles
GET    /api/roles/:id                  # Obtener por ID
POST   /api/roles                      # Crear rol personalizado
PUT    /api/roles/:id                  # Actualizar rol
DELETE /api/roles/:id                  # Eliminar rol (solo custom)
POST   /api/roles/init-system-roles    # Inicializar 5 roles del sistema
```

#### 7. **Permissions** (`/api/permissions`) - 7 endpoints
```
GET    /api/permissions                # Listar permisos
GET    /api/permissions/:id            # Obtener por ID
POST   /api/permissions                # Crear permiso
PUT    /api/permissions/:id            # Actualizar permiso
DELETE /api/permissions/:id            # Eliminar permiso
GET    /api/permissions/grouped        # Permisos agrupados por categoría
GET    /api/permissions/categories     # Lista de categorías
```

#### 8. **Specialties** (`/api/specialties`) - 9 endpoints
```
GET    /api/specialties                # Listar especialidades
GET    /api/specialties/:id            # Obtener por ID
POST   /api/specialties                # Crear especialidad
PUT    /api/specialties/:id            # Actualizar especialidad
DELETE /api/specialties/:id            # Eliminar especialidad
GET    /api/specialties/active         # Solo especialidades activas
POST   /api/specialties/:id/activate   # Activar especialidad
POST   /api/specialties/:id/deactivate # Desactivar especialidad
POST   /api/specialties/init-defaults  # Inicializar 39 especialidades
```

#### 9. **Role-Permissions** (`/api/role-permissions`) - 6 endpoints
```
GET    /api/role-permissions/role/:role_id           # Permisos de un rol
GET    /api/role-permissions/permission/:permission_id # Roles con permiso
POST   /api/role-permissions/assign                   # Asignar permiso a rol
POST   /api/role-permissions/assign-multiple          # Asignar múltiples
POST   /api/role-permissions/replace                  # Reemplazar todos
POST   /api/role-permissions/revoke                   # Revocar permiso
```

#### 10. **User-Specialties** (`/api/user-specialties`) - 7 endpoints
```
GET    /api/user-specialties/user/:user_id              # Especialidades de usuario
GET    /api/user-specialties/specialty/:specialty_id/users # Usuarios con especialidad
POST   /api/user-specialties/assign                     # Asignar especialidad
POST   /api/user-specialties/assign-multiple            # Asignar múltiples
POST   /api/user-specialties/replace                    # Reemplazar todas
POST   /api/user-specialties/set-primary                # Establecer primaria
POST   /api/user-specialties/revoke                     # Revocar especialidad
```

### APIs Clínicas (FHIR)

#### 11. **Patients** (`/api/patients`) - 6 endpoints
```
GET    /api/patients                   # Listar pacientes (filtros: search, gender, org)
GET    /api/patients/:id               # Obtener por ID
POST   /api/patients                   # Crear paciente (FHIR Patient)
PUT    /api/patients/:id               # Actualizar paciente
DELETE /api/patients/:id               # Eliminar paciente (soft delete)
GET    /api/patients/search            # Búsqueda por nombre/MRN
```

#### 12. **Patient Contacts** (`/api/patient-contacts`) - 5 endpoints
```
GET    /api/patient-contacts?patient_id=X  # Contactos de paciente
GET    /api/patient-contacts/:id           # Obtener por ID
POST   /api/patient-contacts               # Crear contacto emergencia (FHIR RelatedPerson)
PUT    /api/patient-contacts/:id           # Actualizar contacto
DELETE /api/patient-contacts/:id           # Eliminar contacto
```

#### 13. **Allergies Catalog** (`/api/allergies`) - 6 endpoints
```
GET    /api/allergies                  # Catálogo de alergenos (22 precargados)
GET    /api/allergies/:id              # Obtener por ID
POST   /api/allergies                  # Crear alergia en catálogo
PUT    /api/allergies/:id              # Actualizar alergia
DELETE /api/allergies/:id              # Eliminar alergia
GET    /api/allergies/categories       # Categorías (medication, food, environment)
```

#### 14. **Patient Allergies** (`/api/patient-allergies`) - 5 endpoints
```
GET    /api/patient-allergies?patient_id=X # Alergias del paciente
GET    /api/patient-allergies/:id          # Obtener por ID
POST   /api/patient-allergies              # Registrar alergia (FHIR AllergyIntolerance)
PUT    /api/patient-allergies/:id          # Actualizar alergia
DELETE /api/patient-allergies/:id          # Eliminar alergia
```

#### 15. **Medications Catalog** (`/api/medications`) - 6 endpoints
```
GET    /api/medications                # Catálogo de medicamentos (22 precargados)
GET    /api/medications/:id            # Obtener por ID
POST   /api/medications                # Crear medicamento en catálogo
PUT    /api/medications/:id            # Actualizar medicamento
DELETE /api/medications/:id            # Eliminar medicamento
GET    /api/medications/categories     # Categorías (antibiotic, analgesic, etc.)
```

#### 16. **Patient Medications** (`/api/patient-medications`) - 5 endpoints
```
GET    /api/patient-medications?patient_id=X # Medicamentos del paciente
GET    /api/patient-medications/:id          # Obtener por ID
POST   /api/patient-medications              # Registrar medicamento (FHIR MedicationStatement)
PUT    /api/patient-medications/:id          # Actualizar medicamento
DELETE /api/patient-medications/:id          # Eliminar medicamento
```

#### 17. **Patient Conditions** (`/api/patient-conditions`) - 5 endpoints
```
GET    /api/patient-conditions?patient_id=X  # Condiciones del paciente
GET    /api/patient-conditions/:id           # Obtener por ID
POST   /api/patient-conditions               # Registrar condición (FHIR Condition)
PUT    /api/patient-conditions/:id           # Actualizar condición
DELETE /api/patient-conditions/:id           # Eliminar condición
```


## 🎨 Frontend - TypeScript Services (15+ archivos)

Capa de servicios con type-safety completo en `frontend/lib/services/`:

### Servicios Core

1. **authService.ts**
   - Interface: `LoginCredentials`, `RegisterData`, `AuthResponse`
   - Métodos: `login()`, `register()`, `getCurrentUser()`, `logout()`

2. **organizationService.ts**
   - Interface: `Organization`, `OrganizationStats`
   - Métodos: CRUD + `getStats()`, `activate()`, `deactivate()`

3. **userService.ts**
   - Interface: `User`, `CreateUserData`
   - Métodos: CRUD + `validateUsername()`, `validateEmail()`, `resetPassword()`

4. **subscriptionService.ts**
   - Interface: `Subscription`
   - Métodos: CRUD + `cancel()`, `renew()`, `getCurrentPlan()`

5. **roleService.ts**
   - Interface: `Role`
   - Métodos: CRUD + `initSystemRoles()`

6. **permissionService.ts**
   - Interface: `Permission`, `PermissionsGrouped`
   - Métodos: CRUD + `getGrouped()`, `getCategories()`

7. **specialtyService.ts**
   - Interface: `Specialty`
   - Métodos: CRUD + `getActive()`, `activate()`, `deactivate()`, `initDefaults()`

8. **rolePermissionService.ts**
   - Interface: `RolePermission`
   - Métodos: `assign()`, `assignMultiple()`, `replace()`, `revoke()`

9. **userSpecialtyService.ts**
   - Interface: `UserSpecialty`
   - Métodos: `assign()`, `assignMultiple()`, `replace()`, `setPrimary()`, `revoke()`

### Servicios Clínicos

10. **patientService.ts**
    - Interface: `Patient`, `CreatePatientData`
    - Métodos: CRUD + `search()`, `getByOrganization()`

11. **patientContactService.ts**
    - Interface: `PatientContact`, `CreateContactData`
    - Métodos: CRUD (todas requieren `patient_id`)

12. **allergyService.ts** (Catálogo)
    - Interface: `AllergyCatalog`
    - Métodos: `getAll()`, `getById()`, `create()`, `update()`, `delete()`, `getCategories()`

13. **patientAllergyService.ts**
    - Interface: `PatientAllergy`, `CreatePatientAllergyData`
    - Métodos: CRUD con soporte para catálogo o alergias personalizadas

14. **medicationService.ts** (Catálogo)
    - Interface: `MedicationCatalog`
    - Métodos: `getAll()`, `getById()`, `create()`, `update()`, `delete()`, `getCategories()`, `search()`

15. **patientMedicationService.ts**
    - Interface: `PatientMedication`, `CreatePatientMedicationData`
    - Métodos: CRUD con soporte para catálogo o medicamentos personalizados

16. **patientConditionService.ts**
    - Interface: `PatientCondition`, `CreateConditionData`
    - Métodos: CRUD para condiciones médicas

### Uso de Servicios
```typescript
// Importar desde index centralizado
import { 
  userService, 
  roleService, 
  patientService,
  medicationService,
  patientMedicationService 
} from '@/lib/services';

// Ejemplo: Crear paciente
const newPatient = await patientService.create({
  first_name: 'Juan',
  last_name: 'Pérez',
  gender: 'male',
  birth_date: '1985-05-15',
  organization_id: 1
});

// Ejemplo: Buscar medicamento en catálogo
const medications = await medicationService.search('amoxicillin');

// Ejemplo: Registrar medicamento del paciente
await patientMedicationService.create(patientId, {
  medication_id: 1,  // Del catálogo
  medication_name: 'Amoxicillin 500mg',
  status: 'active',
  dose: '500 mg',
  route: 'oral',
  frequency: 'every 8 hours'
});
```

## 🎯 Features Clave

### 1. Sistema de Permisos Granular
- **120 permisos** organizados en 19 categorías
- Guards de permisos en componentes: `<PermissionGuard permission="patients.create">`
- Hook personalizado: `usePermissions()` para verificación programática
- Permisos por módulo: users, roles, patients, allergies, medications, conditions, etc.

### 2. Sistema Multi-Tenant
- Organizaciones completamente independientes
- Datos aislados por `organization_id`
- 12 paletas de color personalizables por organización
- Gestión de límites por plan de suscripción

### 3. Gestión de Pacientes FHIR
- **Vista de lista** con búsqueda y filtros
- **Vista detallada** con sistema de tabs:
  - **General**: Información demográfica
  - **Contactos**: Contactos de emergencia (FHIR RelatedPerson)
  - **Alergias**: AllergyIntolerance con catálogo y fuzzy search
  - **Medicamentos**: MedicationStatement con catálogo y fuzzy search
  - **Condiciones**: Próximamente

### 4. Catálogos Inteligentes
- **22 alergias** precargadas (SNOMED CT)
- **22 medicamentos** precargados (RxNorm, NDC, ATC)
- **Fuzzy search** para autocompletado inteligente
- Permite agregar elementos personalizados no en catálogo
- Información contextual: códigos, categorías, severidad, usos comunes

### 5. UI/UX Avanzada
- **Fuzzy search** con algoritmo custom (exact + character-order matching)
- **Modales con backdrop blur** efecto glassmorphism
- **Badges de estado** con iconos y colores semánticos
- **Tarjetas de información** del catálogo con códigos estándar
- **Sistema de tabs** para organización de información
- **Responsive design** completo con Tailwind CSS

### 6. Integración de Suscripciones
- **LemonSqueezy** como procesador de pagos
- Webhooks para sincronización automática
- 3 planes: Basic, Professional, Enterprise
- Límites por plan (usuarios, pacientes, almacenamiento)
- Upgrade/downgrade con validación de límites

## 🗂️ Estructura del Proyecto

```
DoctorCRM2.0/
├── backend/
│   ├── app.py                          # Aplicación Flask principal
│   ├── config/
│   │   ├── lemonsqueezy.py            # Config LemonSqueezy
│   │   └── subscription_plans.py       # Definición de planes
│   ├── lib/
│   │   └── lemonsqueezy_service.py    # Servicio LemonSqueezy
│   ├── models/                         # 15 modelos SQLAlchemy
│   │   ├── organization.py
│   │   ├── user.py
│   │   ├── subscription.py
│   │   ├── role.py
│   │   ├── permission.py
│   │   ├── specialty.py
│   │   ├── patient.py
│   │   ├── patient_contact.py
│   │   ├── allergy.py                 # Catálogo
│   │   ├── patient_allergy.py
│   │   ├── medication.py              # Catálogo
│   │   ├── patient_medication.py
│   │   ├── patient_condition.py
│   │   └── [relationship tables]
│   ├── routes/                         # 17 blueprints
│   │   ├── auth.py
│   │   ├── organizations.py
│   │   ├── users.py
│   │   ├── subscriptions.py
│   │   ├── webhooks.py
│   │   ├── roles.py
│   │   ├── permissions.py
│   │   ├── specialties.py
│   │   ├── patients.py
│   │   ├── patient_contacts.py
│   │   ├── allergies.py
│   │   ├── patient_allergies.py
│   │   ├── medications.py
│   │   ├── patient_medications.py
│   │   ├── patient_conditions.py
│   │   └── [relationship routes]
│   ├── migrations/                     # Migraciones DB
│   ├── seed_permissions.py            # 120 permisos
│   ├── seed_default_specialties.py    # 39 especialidades
│   ├── seed_allergies.py              # 22 alergias
│   ├── seed_medications.py            # 22 medicamentos
│   ├── reset_db.py                    # Reset completo DB
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                   # Landing page
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx               # Dashboard con stats por permiso
│   │       ├── patients/
│   │       │   ├── page.tsx           # Lista de pacientes
│   │       │   ├── new/page.tsx       # Crear paciente
│   │       │   └── [id]/page.tsx      # Vista detallada con tabs
│   │       ├── team/page.tsx
│   │       ├── roles/page.tsx
│   │       ├── specialties/page.tsx
│   │       ├── permissions/page.tsx
│   │       ├── profile/page.tsx
│   │       ├── organization/page.tsx
│   │       └── subscription/page.tsx
│   ├── components/
│   │   ├── ProtectedRoute.tsx         # HOC para rutas protegidas
│   │   ├── SubscriptionChangeModal.tsx
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx            # Sidebar con permisos
│   │   │   ├── TopNavbar.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── UserModal.tsx
│   │   │   ├── RoleModal.tsx
│   │   │   └── SpecialtyModal.tsx
│   │   ├── patients/
│   │   │   ├── AllergiesTab.tsx       # 859 líneas, fuzzy search
│   │   │   ├── MedicationsTab.tsx     # 906 líneas, fuzzy search
│   │   │   └── EmergencyContactsTab.tsx
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── [otros componentes]
│   │   └── icons/
│   │       └── MedicalIcon.tsx
│   ├── lib/
│   │   ├── api.ts                     # Cliente API base
│   │   ├── colorPalettes.ts           # 12 paletas
│   │   ├── subscriptionPlans.ts       # Definición de planes
│   │   ├── hooks/
│   │   │   └── usePermissions.ts      # Hook de permisos
│   │   └── services/                  # 16 servicios TypeScript
│   │       ├── index.ts               # Export centralizado
│   │       ├── authService.ts
│   │       ├── organizationService.ts
│   │       ├── userService.ts
│   │       ├── subscriptionService.ts
│   │       ├── roleService.ts
│   │       ├── permissionService.ts
│   │       ├── specialtyService.ts
│   │       ├── patientService.ts
│   │       ├── patientContactService.ts
│   │       ├── allergyService.ts
│   │       ├── patientAllergyService.ts
│   │       ├── medicationService.ts
│   │       ├── patientMedicationService.ts
│   │       ├── patientConditionService.ts
│   │       └── [relationship services]
│   ├── contexts/
│   │   └── AuthContext.tsx            # Context de autenticación
│   ├── types/
│   │   └── index.ts                   # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
└── README.md

```

## 📋 Requisitos Previos

1. **Python 3.13.2** instalado
2. **Node.js 18+** instalado
3. **PostgreSQL 14+** instalado y ejecutándose
4. **Git** para control de versiones

## 🔧 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/ivanlozaDEV/MedicCRM2.0.git
cd MedicCRM2.0
```

### 2. Configurar Base de Datos PostgreSQL

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

### 3. Configurar Backend (Flask)

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
```

**Variables de entorno** (`backend/.env`):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/doctorcrm2.0
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doctorcrm2.0
DB_USER=postgres
DB_PASSWORD=postgres
FLASK_PORT=5001
SECRET_KEY=tu-clave-secreta-aqui
JWT_SECRET_KEY=tu-jwt-secret-aqui
```

**⚠️ IMPORTANTE**: Cambia `SECRET_KEY` y `JWT_SECRET_KEY` en producción.

### 4. Inicializar Base de Datos con Datos de Seed

```bash
# Desde backend/ con .venv activado
python reset_db.py
```

Esto creará:
- ✅ Todas las tablas (15 modelos)
- ✅ **120 permisos** organizados en 19 categorías
- ✅ **39 especialidades** médicas con iconos
- ✅ **22 alergias** precargadas (SNOMED CT)
- ✅ **22 medicamentos** precargados (RxNorm/NDC/ATC)
- ✅ 5 roles del sistema (Super Admin, Admin, Doctor, Nurse, Receptionist)

### 5. Configurar Frontend (Next.js)

```bash
# Navegar al directorio frontend
cd ../frontend

# Instalar dependencias
npm install
```

**Variables de entorno** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## 🚀 Ejecutar la Aplicación

### Opción 1: Script de Inicio Rápido (Recomendado)

```bash
# Desde la raíz del proyecto
chmod +x start.sh
./start.sh
```

Esto ejecuta:
- Backend en `http://localhost:5001`
- Frontend en `http://localhost:3000`

### Opción 2: Ejecutar Manualmente en Terminales Separadas

#### Terminal 1 - Backend:
```bash
cd backend
source .venv/bin/activate  # Activar entorno virtual
python app.py
```
✅ Backend corriendo en `http://localhost:5001`

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
✅ Frontend corriendo en `http://localhost:3000`

### Opción 3: Modo Desarrollo con Auto-reload

```bash
# Terminal 1 - Backend con auto-reload
cd backend
source .venv/bin/activate
flask run --reload --port 5001

# Terminal 2 - Frontend con auto-reload
cd frontend
npm run dev
```

## 🎬 Primeros Pasos

### 1. Crear una Organización y Usuario

```bash
# Acceder a http://localhost:3000/signup

# Crear cuenta:
- Nombre de organización: "Mi Clínica"
- Email: admin@miclinica.com
- Contraseña: (tu contraseña segura)
- Nombre: "Dr. Juan"
- Apellido: "Pérez"
```

### 2. Asignar Rol y Permisos

```bash
# Desde backend/, con psql o script Python:
cd backend
source .venv/bin/activate
python change_role_to_doctor.py  # Asigna rol Doctor con permisos completos
```

### 3. Explorar el Dashboard

Accede a `http://localhost:3000/dashboard` y verás:
- **Stats Cards** organizadas por categorías de permisos
- **Sidebar** con módulos según tus permisos
- **Secciones disponibles**: Pacientes, Team, Roles, Specialties, etc.

### 4. Crear tu Primer Paciente

1. Ve a **Dashboard → Pacientes → Agregar Paciente**
2. Completa el formulario FHIR:
   - Información demográfica
   - Identificadores (MRN, SSN opcional)
   - Contacto y dirección
3. Guarda y explora los **tabs**:
   - **Contactos**: Agrega contactos de emergencia
   - **Alergias**: Usa fuzzy search para buscar en catálogo
   - **Medicamentos**: Usa fuzzy search para buscar medicamentos
   - **Condiciones**: Próximamente

## 🔑 Usuarios de Prueba

Después de ejecutar `reset_db.py` y crear tu primera organización, puedes crear usuarios con diferentes roles:

```python
# Ejemplo: Crear usuario Nurse
from backend.models import User, Role
from backend.app import db

nurse_role = Role.query.filter_by(name='Nurse', is_system=True).first()
user = User(
    username='nurse1',
    email='nurse@example.com',
    first_name='María',
    last_name='García',
    organization_id=1  # Tu organización
)
user.set_password('password123')
db.session.add(user)
db.session.commit()

# Asignar rol
from backend.models.user_role import user_role
db.session.execute(
    user_role.insert().values(user_id=user.id, role_id=nurse_role.id)
)
db.session.commit()
```

## 📊 Datos Precargados

### Permisos (120)
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


## 📈 Estado del Proyecto

### ✅ Completado (85%)

#### Backend (100%)
- ✅ **15 modelos** de base de datos con relaciones complejas
- ✅ **100+ endpoints** API REST organizados en 17 blueprints
- ✅ Sistema completo de **roles y permisos** (120 permisos, 19 categorías)
- ✅ **39 especialidades** médicas con iconos
- ✅ Integración con **LemonSqueezy** (webhooks, planes, límites)
- ✅ **FHIR R4** compliance para datos clínicos
- ✅ **Catálogos globales**: 22 alergias + 22 medicamentos
- ✅ Sistema de **seeding automático** (permisos, especialidades, alergias, medicamentos)

#### Frontend (80%)
- ✅ **16 servicios TypeScript** con type-safety completo
- ✅ Sistema de **autenticación** con JWT y AuthContext
- ✅ **PermissionGuard** y usePermissions hook
- ✅ **Landing page** moderna y responsive
- ✅ **Dashboard** con stats organizadas por permisos
- ✅ **Gestión de usuarios** con roles y especialidades
- ✅ **Gestión de roles** con asignación de permisos
- ✅ **Gestión de especialidades** con iconos y colores
- ✅ **Gestión de pacientes** (lista, crear, detalle)
- ✅ **Vista detallada de paciente** con sistema de tabs
- ✅ **Contactos de emergencia** (FHIR RelatedPerson)
- ✅ **Alergias** con catálogo y fuzzy search (859 líneas)
- ✅ **Medicamentos** con catálogo y fuzzy search (906 líneas)
- ✅ **12 paletas de color** para organizaciones
- ✅ **Subscription management** con upgrade/downgrade
- ✅ UI/UX avanzada: modales blur, badges semánticos, autocomplete inteligente

### � En Progreso (10%)
- � **Condiciones médicas** (FHIR Condition) - modelo y API listos, falta UI
- 🔄 **Observaciones** (FHIR Observation) - signos vitales
- 🔄 **Testing** - unit tests y e2e tests

### 📋 Roadmap (5%)
- 📋 **Sistema de citas** (FHIR Appointment)
- 📋 **Calendario médico** integrado
- 📋 **Documentos clínicos** (FHIR DocumentReference)
- 📋 **Procedimientos** (FHIR Procedure)
- 📋 **Reportes y analytics**
- 📋 **Notificaciones en tiempo real**
- 📋 **Deployment** (Docker, CI/CD)

## 📜 Historial de Desarrollo

### Branch: `patients` (Actual)
```
02f293d - feat: Translate medications modal to Spanish (Nov 10, 2025)
dd4524e - feat: Implement complete medications system with catalog and fuzzy search
c8010fd - feat: Enhance allergies UI with catalog selector and improved UX
fac2752 - feat: Implement complete allergies functionality with FHIR compliance
8ac5ae3 - feat: Implement emergency contacts tab with full CRUD
d86511f - feat: Implementar vista detallada de paciente con sistema de tabs
7826cdd - feat: Implementar UI básica de pacientes con verificación de permisos
d4bcb3d - fix: Actualizar sistema de permisos y roles para FHIR
15b8a4d - feat: Sistema completo de gestión de pacientes con estándares FHIR
```

### Branch: `subscriptions` (Merged)
```
191cf85 - feat: Sistema completo de upgrade/downgrade con validación y notificaciones
a5977b7 - fix: Mejorar manejo de webhooks de LemonSqueezy
3b5a63b - feat: Implementar sistema completo de suscripciones con LemonSqueezy
```

### Branch: `main` (Stable)
```
202b9b7 - fix: Add permission guards and empty section handling
7316e5f - feat: Implement dashboard sectoring by permission categories with compact stats
463ea3a - feat: Add color palette system, profile page, and organization management
c67daf5 - feat: Add complete specialty management system with icons and user assignment
31fe190 - feat: Multi-tenant roles and permissions system
603bb01 - feat: Implement hardcoded permissions system
19e05f5 - feat: Complete role management system
364a9ca - feat: Complete authentication system and user management
ca22edf - docs: Update README with complete project documentation
2f4a756 - feat: Add complete TypeScript service layer for all backend APIs
a50cdbb - feat: Add complete CRUD API routes for all models using Flask Blueprints
```

## 🎯 Logros Técnicos Destacados

1. **Arquitectura Escalable**
   - Backend modular con Flask Blueprints
   - Frontend con App Router de Next.js
   - Separación clara de responsabilidades

2. **Type-Safety End-to-End**
   - TypeScript en frontend con interfaces completas
   - SQLAlchemy con type hints en backend
   - Validación de datos en ambas capas

3. **FHIR R4 Compliance**
   - Patient, RelatedPerson, AllergyIntolerance, MedicationStatement, Condition
   - Códigos estándar: SNOMED CT, RxNorm, NDC, ATC, ICD-10
   - Estructura de datos conforme a estándares internacionales

4. **Sistema de Permisos Granular**
   - 120 permisos organizados en 19 categorías
   - Guards reutilizables en componentes
   - Lógica centralizada con hook personalizado

5. **UX Innovadora**
   - Fuzzy search algorithm custom para autocomplete
   - Catálogos inteligentes con fallback a custom
   - Modales glassmorphism con backdrop blur
   - Responsive design con Tailwind CSS

6. **Multi-Tenancy Robusto**
   - Aislamiento completo de datos por organización
   - Personalización (12 paletas de color)
   - Límites por plan de suscripción

## 🛠️ Tecnologías y Patrones Aplicados

- **Backend**: Flask, SQLAlchemy, JWT, Blueprints, PostgreSQL
- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS 4
- **Arquitectura**: RESTful API, Service Layer Pattern, Repository Pattern
- **Seguridad**: JWT tokens, password hashing (bcrypt), CORS configurado
- **Estándares**: FHIR R4, SNOMED CT, RxNorm, NDC, ATC, ICD-10
- **Pagos**: LemonSqueezy con webhooks
- **UI/UX**: Glassmorphism, Fuzzy Search, Permission Guards, Context API

## 🚀 Quick Start para Desarrollo

```bash
# 1. Clonar y configurar
git clone https://github.com/ivanlozaDEV/MedicCRM2.0.git
cd MedicCRM2.0

# 2. Backend setup
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python reset_db.py  # Crea DB + seed data

# 3. Frontend setup
cd ../frontend
npm install

# 4. Ejecutar (2 terminales)
# Terminal 1: cd backend && source .venv/bin/activate && python app.py
# Terminal 2: cd frontend && npm run dev

# 5. Abrir http://localhost:3000
```

## 📞 Contacto y Contribuciones

- **GitHub**: [ivanlozaDEV/MedicCRM2.0](https://github.com/ivanlozaDEV/MedicCRM2.0)
- **Branch Activo**: `patients`
- **Issues**: Para reportar bugs o sugerir features

---

**DoctorCRM 2.0** - Sistema de gestión médica con estándares FHIR 🏥

*Última actualización: Noviembre 10, 2025*
