# 📅 Sistema de Citas - DoctorCRM 2.0

## ✅ Modelos Implementados

### 1️⃣ AppointmentType (Tipos de Cita)
**Archivo**: `backend/models/appointment_type.py`
**Tipo**: Catálogo GLOBAL (compartido entre organizaciones)
**Base FHIR**: AppointmentType CodeableConcept

#### Campos Principales:
- `name` - Nombre del tipo de cita
- `description` - Descripción detallada
- `code`, `system` - Códigos FHIR (SNOMED CT)
- `default_duration` - Duración por defecto (minutos)
- `color`, `icon` - UI/UX
- `requires_preparation` - Requiere preparación del paciente
- `preparation_instructions` - Instrucciones de preparación
- `is_virtual` - Es teleconsulta

#### Tipos Predefinidos (7):
1. **Consulta General** (30 min)
2. **Consulta de Seguimiento** (20 min)
3. **Primera Consulta** (45 min)
4. **Urgencia** (15 min)
5. **Procedimiento** (60 min)
6. **Teleconsulta** (20 min, virtual)
7. **Examen Médico** (30 min, requiere preparación)

---

### 2️⃣ Room (Salas/Consultorios)
**Archivo**: `backend/models/room.py`
**Tipo**: ORGANIZATION-SCOPED (por organización)
**Base FHIR**: Location resource

#### Campos Principales:
- `organization_id` - Organización propietaria
- `name` - Nombre de la sala
- `identifier` - Código interno (ej: "ROOM-101")
- `room_type` - Tipo de sala (examination, operating, emergency, virtual, office, laboratory, imaging)
- `floor`, `building` - Ubicación física
- `capacity` - Capacidad de personas
- `has_equipment`, `equipment_list` - Equipamiento
- `is_accessible`, `accessibility_notes` - Accesibilidad
- `is_virtual`, `virtual_link_template` - Para telemedicina
- `is_available` - Disponibilidad actual

#### Propiedades:
- `full_location` - Ubicación completa formateada
- `appointment_count` - Contador de citas

---

### 3️⃣ DoctorSchedule (Horarios de Atención)
**Archivo**: `backend/models/doctor_schedule.py`
**Tipo**: ORGANIZATION-SCOPED (usuarios de organización)
**Base FHIR**: Schedule resource

#### Campos Principales:
- `user_id` - Doctor/profesional
- `specialty_id` - Especialidad (opcional)
- `room_id` - Sala por defecto (opcional)
- `name` - Nombre del horario (ej: "Horario Matutino")
- `day_of_week` - Día de la semana (0=Lunes, 6=Domingo)
- `start_time`, `end_time` - Horario de trabajo
- `break_start_time`, `break_end_time` - Tiempo de descanso
- `slot_duration` - Duración de cada slot (minutos)
- `buffer_time` - Tiempo entre citas (minutos)
- `effective_from`, `effective_until` - Rango de fechas (horarios temporales)
- `max_appointments_per_slot` - Capacidad por slot
- `is_recurring` - Se repite semanalmente

#### Propiedades Calculadas:
- `day_name` - Nombre del día en español
- `time_range` - Rango horario formateado
- `has_break` - Tiene tiempo de descanso
- `total_hours` - Total de horas trabajadas
- `available_slots` - Número de slots disponibles

#### Métodos:
- `is_effective_on_date(date)` - Valida si aplica en una fecha

---

### 4️⃣ Appointment (Citas)
**Archivo**: `backend/models/appointment.py`
**Tipo**: ORGANIZATION-SCOPED
**Base FHIR**: Appointment resource

#### Campos Principales:
- `organization_id` - Organización
- `patient_id` - Paciente
- `doctor_id` - Doctor principal
- `appointment_type_id` - Tipo de cita
- `room_id` - Sala/consultorio
- `specialty_id` - Especialidad
- `fhir_id` - Identificador FHIR único
- `appointment_date`, `start_time`, `end_time` - Fecha y hora
- `duration` - Duración en minutos
- **`status`** - Estado FHIR (ver abajo)
- `priority` - Prioridad (routine, urgent, asap, stat)
- `service_category`, `service_type` - Categorías FHIR
- `reason`, `reason_code` - Motivo de la cita (ICD-10/SNOMED)
- `patient_instructions` - Instrucciones para el paciente

#### Estados FHIR (AppointmentStatus):
1. **proposed** - Propuesta
2. **pending** - Pendiente de confirmación
3. **booked** - Confirmada/Agendada ✅
4. **arrived** - Paciente llegó
5. **fulfilled** - Completada
6. **cancelled** - Cancelada
7. **noshow** - No se presentó
8. **entered-in-error** - Error de registro
9. **checked-in** - Registrado
10. **waitlist** - Lista de espera

#### Cancelación:
- `cancellation_reason`
- `cancelled_by_user_id`
- `cancelled_at`

#### Check-in/Check-out:
- `checked_in_at`
- `checked_out_at`
- `arrival_time` - Hora real de llegada

#### Telemedicina:
- `is_virtual`
- `virtual_link` - Link de videoconferencia

#### Recordatorios:
- `reminder_sent`
- `reminder_sent_at`

#### Seguimiento:
- `requires_follow_up`
- `follow_up_date`
- `follow_up_notes`

#### Propiedades Calculadas:
- `is_past`, `is_today`, `is_upcoming`
- `is_active`, `is_completed`
- `can_check_in`, `can_cancel`
- `time_range`

#### Métodos de Acción:
- `check_in()` - Registrar llegada
- `check_out()` - Registrar salida
- `cancel(reason, user_id)` - Cancelar cita
- `mark_no_show()` - Marcar como no presentado

---

## 🎯 Sugerencias FHIR y Arquitectura

### ✅ Implementado (FHIR Lite)
- Estados estándar FHIR
- Campos de codificación (code, system)
- Prioridades estándar
- Service category & type
- Cancelation tracking
- Virtual appointments
- Check-in/check-out workflow

### 💡 Sugerencias Adicionales (Opcional - Fase 2)

#### 1. **AppointmentParticipant** (Tabla Relacional)
Para citas con equipo médico múltiple:

```python
class AppointmentParticipant(db.Model):
    """
    Participants in an appointment (doctors, nurses, specialists).
    Based on FHIR Appointment.participant
    """
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    participant_type = db.Column(db.String(50))  # primary, secondary, assistant
    required = db.Column(db.Boolean, default=True)  # required or optional
    status = db.Column(db.String(20))  # accepted, declined, tentative, needs-action
```

**Casos de uso:**
- Cirugías con equipo médico
- Consultas interdisciplinarias
- Enfermera + Doctor

#### 2. **AppointmentSlot** (Slots Disponibles)
Pre-generar slots disponibles para agendamiento más rápido:

```python
class AppointmentSlot(db.Model):
    """
    Available time slots for appointments.
    Based on FHIR Slot resource.
    """
    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('doctor_schedules.id'))
    date = db.Column(db.Date)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    status = db.Column(db.String(20))  # free, busy, busy-unavailable, busy-tentative
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'))
```

**Ventajas:**
- Búsqueda más rápida de disponibilidad
- Lock de slots durante agendamiento
- Mejor para alta concurrencia

#### 3. **Recurring Appointments** (Citas Recurrentes)
Para terapias, controles periódicos:

```python
# Campos adicionales en Appointment:
is_recurring = db.Column(db.Boolean, default=False)
recurrence_rule = db.Column(db.String(255))  # iCal RRULE format
parent_appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'))
```

#### 4. **Appointment History/Audit**
Log de cambios para compliance:

```python
class AppointmentHistory(db.Model):
    """Audit trail for appointment changes"""
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'))
    changed_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(50))  # created, updated, cancelled, rescheduled
    old_data = db.Column(db.JSON)
    new_data = db.Column(db.JSON)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
```

---

## 📊 Relaciones del Sistema

```
Organization
  ├── Room (1:N)
  ├── Appointment (1:N)
  └── Users
        └── DoctorSchedule (1:N)
              └── defines slots for → Appointment

Patient (1:N) → Appointment
User/Doctor (1:N) → Appointment (as doctor)
AppointmentType (1:N) → Appointment
Room (1:N) → Appointment
Specialty (1:N) → Appointment
DoctorSchedule → defines → Available Slots
```

---

## 🔐 Permisos Sugeridos

Agregar a `seed_permissions.py`:

```python
# Appointment Types
'appointment_types:view', 'appointment_types:create', 
'appointment_types:edit', 'appointment_types:delete'

# Rooms
'rooms:view', 'rooms:create', 'rooms:edit', 'rooms:delete'

# Doctor Schedules
'schedules:view', 'schedules:create', 'schedules:edit', 
'schedules:delete', 'schedules:view_all'

# Appointments
'appointments:view', 'appointments:view_own', 'appointments:view_all',
'appointments:create', 'appointments:edit', 'appointments:delete',
'appointments:cancel', 'appointments:reschedule',
'appointments:check_in', 'appointments:check_out',
'appointments:mark_noshow', 'appointments:view_calendar'
```

---

## 🚀 Próximos Pasos

### 1. Crear Tablas
```bash
python create_tables.py
```

### 2. Seed Appointment Types
```bash
python seed_appointment_types.py
```

### 3. Crear Rutas (Blueprints)
- `backend/routes/appointment_types.py`
- `backend/routes/rooms.py`
- `backend/routes/doctor_schedules.py`
- `backend/routes/appointments.py`

### 4. Frontend
- Vista de calendario
- Formulario de agendamiento
- Check-in/check-out interface
- Gestión de horarios del doctor

---

## 📝 Notas Finales

### ✅ Fortalezas del Diseño:
1. **FHIR R4 Compliant** - Siguiendo estándares internacionales
2. **Multi-tenant** - Aislamiento de datos por organización
3. **Flexible** - Soporta citas virtuales y presenciales
4. **Completo** - Check-in, cancelación, recordatorios, seguimiento
5. **Extensible** - Fácil agregar participants, slots, recurrencia

### ⚠️ Consideraciones:
1. **Timezone**: Usar timezone de la organización
2. **Concurrencia**: Implementar locks al agendar
3. **Notificaciones**: Sistema de recordatorios (email/SMS)
4. **Conflictos**: Validar no doble-booking
5. **Reporting**: Dashboards de ocupación, no-shows, etc.

---

**Status**: ✅ Modelos creados y listos para testing
**Next**: Crear rutas y endpoints REST API
