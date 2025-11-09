# DoctorCRM 2.0 - Backend

Backend API para DoctorCRM 2.0 construido con Flask.

## Tecnologías

- Python 3.13.2
- Flask 3.1.0
- PostgreSQL
- Flask-SQLAlchemy 3.1.1
- Flask-JWT-Extended 4.6.0
- Flask-Cors 5.0.0

## Configuración

### 1. Crear base de datos PostgreSQL

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE doctorcrm;

# Salir
\q
```

### 2. Configurar entorno virtual

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # En macOS/Linux
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

El archivo `.env` ya está configurado con los valores por defecto:
- Database: `postgresql://postgres:postgres@localhost:5432/doctorcrm`
- Puerto: `5001`

### 5. Ejecutar la aplicación

```bash
python app.py
```

La API estará disponible en: `http://localhost:5001/api`

## Endpoints

### Health Check
- `GET /api/health` - Verificar estado de la API

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

## Modelos de Datos

### User
- username, email, password_hash, role

### Patient
- first_name, last_name, email, phone, date_of_birth, address, medical_history

### Appointment
- patient_id, doctor_name, appointment_date, duration_minutes, status, notes
