# DoctorCRM MCP Server

Servidor MCP (Model Context Protocol) para el proyecto DoctorCRM 2.0. Este servidor proporciona herramientas para que los asistentes de IA exploren y entiendan la estructura, arquitectura y funcionalidad del sistema médico CRM/EHR.

## 🚀 Características

El servidor MCP ofrece **10 herramientas especializadas** para explorar el proyecto:

### 📁 Exploración de Estructura
- **get_project_structure** - Obtiene la estructura completa de archivos y carpetas
- **search_in_project** - Busca archivos por nombre o tipo en todo el proyecto

### 🗄️ Modelos de Base de Datos
- **list_models** - Lista todos los modelos SQLAlchemy (17 modelos)
- **get_model_details** - Obtiene información detallada de un modelo específico
- **get_database_schema** - Esquema completo de la base de datos con relaciones

### 🛣️ Rutas y API
- **list_routes** - Lista todos los blueprints de Flask disponibles
- **get_route_details** - Detalles de una ruta específica con sus endpoints
- **get_api_endpoints** - Lista completa de endpoints REST API

### 📚 Documentación del Sistema
- **get_tech_stack** - Stack tecnológico completo (Backend + Frontend)
- **get_fhir_compliance** - Información sobre implementación FHIR R4

## 📦 Instalación

```bash
cd MCP
npm install
```

Esto instalará todas las dependencias y compilará automáticamente el servidor TypeScript.

## ⚙️ Configuración

### Para GitHub Copilot en VS Code

1. Abre la configuración de VS Code (Cmd+,)
2. Busca "MCP" o "Model Context Protocol"
3. Edita el archivo `settings.json` y agrega:

```json
{
  "github.copilot.chat.mcp.servers": {
    "doctorcrm": {
      "command": "node",
      "args": [
        "/Users/ivanloza/Documents/DoctorCRM2.0/MCP/build/index.js"
      ]
    }
  }
}
```

**Nota**: Ajusta la ruta absoluta según tu sistema.

### Para Claude Desktop

Edita el archivo de configuración de Claude Desktop:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "doctorcrm": {
      "command": "node",
      "args": [
        "/Users/ivanloza/Documents/DoctorCRM2.0/MCP/build/index.js"
      ]
    }
  }
}
```

### Para Otros Clientes MCP

Cualquier cliente compatible con MCP puede usar este servidor mediante stdio:

```bash
node /Users/ivanloza/Documents/DoctorCRM2.0/MCP/build/index.js
```

## 🔧 Desarrollo

### Compilar el Proyecto

```bash
npm run build
```

### Modo Watch (desarrollo)

```bash
npm run watch
```

### Estructura del Proyecto

```
MCP/
├── src/
│   └── index.ts          # Código fuente del servidor MCP
├── build/                # Código compilado
├── package.json          # Dependencias y scripts
├── tsconfig.json         # Configuración TypeScript
└── README.md            # Este archivo
```

## 🛠️ Herramientas Disponibles

### 1. get_project_structure
Obtiene la estructura de archivos y carpetas del proyecto.

**Parámetros:**
- `depth` (opcional): Profundidad máxima de exploración

**Ejemplo de uso:**
```
"Muéstrame la estructura del proyecto con profundidad 2"
```

### 2. list_models
Lista todos los 17 modelos de base de datos con descripciones breves.

**Modelos incluidos:**
- Organization, User, Subscription
- Role, Permission, Specialty
- Patient, PatientContact
- Allergy, PatientAllergy
- Medication, PatientMedication
- Condition, PatientCondition
- RolePermission, UserRole, UserSpecialty

### 3. get_model_details
Obtiene el código completo y detalles de un modelo específico.

**Parámetros:**
- `modelName` (requerido): Nombre del modelo (ej: "Patient", "User")

**Ejemplo:**
```
"Dame los detalles del modelo Patient"
```

### 4. list_routes
Lista todos los 16 blueprints de Flask con sus descripciones.

**Rutas incluidas:**
- auth, organizations, users, subscriptions
- roles, permissions, specialties
- patients, patient_contacts
- allergies, patient_allergies
- medications, patient_medications
- conditions, patient_conditions
- webhooks

### 5. get_route_details
Obtiene el código completo de una ruta específica.

**Parámetros:**
- `routeName` (requerido): Nombre de la ruta (ej: "patients", "auth")

**Ejemplo:**
```
"Muéstrame la ruta de autenticación"
```

### 6. get_database_schema
Obtiene el esquema completo de la base de datos PostgreSQL.

**Información incluida:**
- 14 tablas principales
- Campos clave de cada tabla
- Todas las relaciones entre tablas

### 7. search_in_project
Busca archivos en el proyecto por nombre o tipo.

**Parámetros:**
- `query` (requerido): Término de búsqueda
- `fileType` (opcional): Extensión de archivo (ej: "py", "ts", "tsx")

**Ejemplo:**
```
"Busca todos los archivos TypeScript que contengan 'patient'"
```

### 8. get_api_endpoints
Lista completa de todos los endpoints REST API organizados por categoría.

**Categorías:**
- Authentication
- Organizations
- Users
- Patients
- Clinical Data (allergies, medications, conditions)
- Catalogs
- RBAC (roles, permissions)
- Subscriptions

### 9. get_tech_stack
Información completa del stack tecnológico.

**Incluye:**
- Backend: Python, Flask, PostgreSQL, SQLAlchemy
- Frontend: Next.js, React, TypeScript, TailwindCSS
- Estándares: FHIR R4, Multi-tenant SaaS
- Integraciones: LemonSqueezy

### 10. get_fhir_compliance
Detalles sobre la implementación de FHIR R4.

**Información incluida:**
- Mapeo de modelos a recursos FHIR
- Campos FHIR en cada modelo
- Datos semilla con estándares FHIR
- Notas de cumplimiento

## 📖 Casos de Uso

### Explorar el Proyecto
```
"Muéstrame la estructura completa del proyecto"
"¿Qué modelos tiene el sistema?"
"Lista todas las rutas API disponibles"
```

### Entender la Arquitectura
```
"¿Qué tecnologías usa este proyecto?"
"Explica el esquema de la base de datos"
"¿Cómo funciona la multi-tenencia?"
```

### Trabajar con Modelos
```
"Dame los detalles del modelo Patient"
"¿Qué campos tiene el modelo User?"
"Muéstrame la relación entre Patient y Allergy"
```

### Explorar APIs
```
"¿Qué endpoints hay para pacientes?"
"Muéstrame la ruta de autenticación"
"¿Cómo funcionan los webhooks de LemonSqueezy?"
```

### FHIR y Estándares
```
"¿Cómo implementa este proyecto FHIR R4?"
"¿Qué modelos son compatibles con FHIR?"
"Dame los campos FHIR del modelo Patient"
```

## 🔍 Información del Proyecto

### DoctorCRM 2.0
Sistema completo de gestión médica (CRM/EHR) con:
- ✅ Multi-tenancy basado en organizaciones
- ✅ Sistema RBAC con 120 permisos granulares
- ✅ 5 roles del sistema + roles personalizados
- ✅ 39 especialidades médicas predefinidas
- ✅ Cumplimiento FHIR R4
- ✅ Gestión completa de pacientes y datos clínicos
- ✅ Integración con LemonSqueezy para suscripciones
- ✅ Routing con slug de organización

### Stack Resumido
- **Backend**: Flask + PostgreSQL + SQLAlchemy
- **Frontend**: Next.js + React + TypeScript + TailwindCSS
- **Puerto Backend**: 5001
- **Puerto Frontend**: 3000
- **Base de Datos**: doctorcrm2.0 (PostgreSQL 14.19)

## 📝 Notas de Desarrollo

- El servidor MCP se ejecuta en modo stdio (entrada/salida estándar)
- Excluye automáticamente carpetas como `node_modules`, `__pycache__`, `.git`
- Todas las rutas de archivos son relativas al directorio raíz del proyecto
- El servidor es compatible con cualquier cliente MCP

## 🤝 Contribuir

Para agregar nuevas herramientas al servidor MCP:

1. Agrega la herramienta en `getTools()` con su esquema
2. Implementa el handler en el switch de `CallToolRequestSchema`
3. Crea el método privado correspondiente
4. Recompila con `npm run build`

## 📄 Licencia

MIT

---

**Desarrollado para DoctorCRM 2.0** - Sistema médico CRM/EHR de próxima generación 🏥
