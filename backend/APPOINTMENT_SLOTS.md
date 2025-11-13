# 🎰 Sistema de Slots - DoctorCRM 2.0

## 📋 ¿Qué son los Appointment Slots?

Los **Appointment Slots** son ranuras de tiempo pre-generadas basadas en los horarios de los doctores (`DoctorSchedule`). Este sistema:

- ✅ **Previene double-booking** (doble reserva)
- ✅ **Mejora el performance** al buscar disponibilidad
- ✅ **Facilita el agendamiento** con búsquedas rápidas
- ✅ **Permite bloqueos** (reuniones, capacitaciones, emergencias)
- ✅ **Soporta overbooking** para urgencias

## 🏗️ Arquitectura

```
DoctorSchedule (Horario del doctor)
     ↓
AppointmentSlot (Slots pre-generados)
     ↓
Appointment (Cita agendada)
```

### Flujo de Trabajo:

1. **Admin configura** `DoctorSchedule` para un doctor
2. **Sistema genera** `AppointmentSlot` basado en el schedule
3. **Usuario busca** slots disponibles
4. **Usuario agenda** → crea `Appointment` + marca slot como "busy"
5. **Usuario cancela** → `Appointment` libera el slot

## 📊 Modelo AppointmentSlot

### Campos Principales:

| Campo | Descripción |
|-------|-------------|
| `schedule_id` | Horario base del doctor |
| `doctor_id` | Doctor propietario |
| `organization_id` | Organización (multi-tenant) |
| `slot_date` | Fecha del slot |
| `start_time` | Hora de inicio |
| `end_time` | Hora de fin |
| `duration` | Duración en minutos |
| `status` | **free** \| busy \| busy-unavailable \| busy-tentative |
| `appointment_id` | Cita asignada (si está ocupado) |
| `is_blocked` | Bloqueado (no disponible) |
| `block_reason` | Razón del bloqueo |

### Estados FHIR:

1. **free** - Disponible para agendar ✅
2. **busy** - Ocupado por una cita
3. **busy-unavailable** - Bloqueado (reunión, capacitación, etc.)
4. **busy-tentative** - Reservado temporalmente (en proceso de agendamiento)

## 🚀 Uso del Sistema

### 1. Generar Slots

```bash
# Generar slots para los próximos 30 días (todos los doctores)
python generate_slots.py --days 30

# Generar para un doctor específico
python generate_slots.py --doctor 5 --days 14

# Generar para un rango de fechas
python generate_slots.py --from 2025-01-01 --to 2025-01-31

# Ver estadísticas
python generate_slots.py --stats

# Limpiar slots antiguos (mantener últimos 30 días)
python generate_slots.py --cleanup 30
```

### 2. Buscar Slots Disponibles (API)

```python
from models.appointment_slot import AppointmentSlot
from datetime import date

# Buscar slots disponibles de un doctor para una fecha
slots = AppointmentSlot.get_available_slots(
    doctor_id=5,
    start_date=date(2025, 1, 15),
    end_date=date(2025, 1, 15)
)

# Buscar todos los slots de una fecha (con filtros)
slots = AppointmentSlot.get_slots_by_date(
    organization_id=1,
    slot_date=date(2025, 1, 15),
    doctor_id=5,  # opcional
    specialty_id=2  # opcional
)
```

### 3. Crear Cita y Reservar Slot

```python
from models.appointment import Appointment
from models.appointment_slot import AppointmentSlot

# 1. Buscar slot disponible
slot = AppointmentSlot.query.filter_by(
    doctor_id=5,
    slot_date=date(2025, 1, 15),
    start_time=time(10, 0),
    status='free'
).first()

if slot and slot.is_available:
    # 2. Crear cita
    appointment = Appointment(
        organization_id=1,
        patient_id=10,
        doctor_id=5,
        appointment_date=slot.slot_date,
        start_time=slot.start_time,
        end_time=slot.end_time,
        duration=slot.duration,
        status='booked'
    )
    db.session.add(appointment)
    db.session.commit()
    
    # 3. Reservar slot (automático con sync_with_slot)
    appointment.sync_with_slot()
```

### 4. Cancelar Cita y Liberar Slot

```python
# Cancelar cita automáticamente libera el slot
appointment.cancel(
    reason="Paciente no puede asistir",
    cancelled_by_user_id=1
)
# El método cancel() llama internamente a release_slot()
```

### 5. Bloquear/Desbloquear Slots

```python
# Bloquear slot (reunión, capacitación, etc.)
slot.block(
    reason="Reunión administrativa",
    blocked_by_user_id=1
)

# Desbloquear slot
slot.unblock()
```

## 🔄 Generación Automática

### Cómo Funciona:

1. **Sistema lee** `DoctorSchedule` (ej: Lunes 8:00-17:00, slots de 30 min)
2. **Calcula slots**:
   - 8:00-8:30 ✅
   - 8:30-9:00 ✅
   - 9:00-9:30 ✅
   - ...
   - 13:00-14:00 ❌ (break time)
   - ...
   - 16:30-17:00 ✅

3. **Crea registros** en `appointment_slots` con status='free'

### Algoritmo:

```python
# Pseudocódigo
for cada día en rango_de_fechas:
    if día.weekday == schedule.day_of_week:
        current_time = schedule.start_time
        while current_time < schedule.end_time:
            if not en_break_time(current_time):
                crear_slot(current_time, duration=slot_duration)
            current_time += slot_duration + buffer_time
```

## 📈 Ventajas del Sistema de Slots

### ✅ Performance
- **Búsqueda rápida**: Un query simple encuentra disponibilidad
- **Sin cálculos**: No necesita calcular slots en tiempo real
- **Indexado**: Búsquedas optimizadas con índices en DB

### ✅ Prevención de Conflictos
- **Lock de slots**: Al agendar, el slot se marca como "busy"
- **Transacciones atómicas**: Evita race conditions
- **Validación simple**: `if slot.status == 'free'`

### ✅ Flexibilidad
- **Bloqueos**: Marcar slots como no disponibles
- **Overbooking**: Permitir citas adicionales en emergencias
- **Modificación dinámica**: Cambiar status sin recalcular

### ✅ Reportes
- **Ocupación**: % de slots ocupados vs disponibles
- **Utilización**: Horas productivas vs no productivas
- **No-shows**: Análisis de ausencias por doctor/especialidad

## 🎯 Casos de Uso

### 1. Calendario de Disponibilidad
```javascript
// Frontend solicita slots disponibles para mostrar en calendario
GET /api/slots/available?doctor=5&date=2025-01-15

Response:
[
  {
    "id": 123,
    "start_time": "08:00",
    "end_time": "08:30",
    "duration": 30,
    "status": "free",
    "is_available": true
  },
  ...
]
```

### 2. Agendamiento Rápido
```javascript
// Usuario selecciona slot y agenda
POST /api/appointments
{
  "slot_id": 123,
  "patient_id": 10,
  "appointment_type_id": 2,
  "reason": "Consulta general"
}

// Backend:
// 1. Valida slot.is_available
// 2. Crea Appointment
// 3. Marca slot como busy
```

### 3. Bloqueo de Horarios
```javascript
// Admin bloquea horarios para reunión
POST /api/slots/block
{
  "doctor_id": 5,
  "start_date": "2025-01-15",
  "start_time": "14:00",
  "end_time": "16:00",
  "reason": "Reunión de equipo"
}

// Backend marca todos los slots en ese rango como busy-unavailable
```

### 4. Dashboard de Ocupación
```sql
-- Query para reporte de ocupación
SELECT 
    doctor_id,
    COUNT(*) as total_slots,
    SUM(CASE WHEN status = 'free' THEN 1 ELSE 0 END) as available,
    SUM(CASE WHEN status = 'busy' THEN 1 ELSE 0 END) as occupied,
    ROUND(SUM(CASE WHEN status = 'busy' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as occupancy_rate
FROM appointment_slots
WHERE slot_date BETWEEN '2025-01-01' AND '2025-01-31'
GROUP BY doctor_id;
```

## 🔧 Mantenimiento

### Generar Slots Periódicamente

Recomendar configurar un **cron job** o **task scheduler**:

```bash
# Cada día a las 2am, generar slots para los próximos 60 días
0 2 * * * cd /path/to/backend && python generate_slots.py --days 60
```

### Limpiar Slots Antiguos

```bash
# Cada semana, limpiar slots de más de 30 días
0 3 * * 0 cd /path/to/backend && python generate_slots.py --cleanup 30
```

## 📝 Mejores Prácticas

1. ✅ **Generar con anticipación**: Mantener slots para al menos 30-60 días
2. ✅ **Limpiar regularmente**: Eliminar slots antiguos para evitar bloat
3. ✅ **Validar disponibilidad**: Siempre verificar `slot.is_available` antes de agendar
4. ✅ **Usar transacciones**: Marcar slot como busy en la misma transacción que crear cita
5. ✅ **Sincronizar cancelaciones**: Liberar slot cuando se cancela cita
6. ✅ **Monitorear ocupación**: Dashboards para detectar problemas de capacidad

## 🔐 Consideraciones de Seguridad

- ✅ **Multi-tenant**: Filtrar siempre por `organization_id`
- ✅ **Validación**: Verificar que doctor pertenece a organización
- ✅ **Permisos**: Validar que usuario puede agendar/cancelar
- ✅ **Locks**: Considerar locks de DB para alta concurrencia

## 🚦 Estados y Transiciones

```
free (disponible)
  ↓ [usuario agenda]
busy (ocupado)
  ↓ [usuario cancela]
free (disponible nuevamente)

free (disponible)
  ↓ [admin bloquea]
busy-unavailable (bloqueado)
  ↓ [admin desbloquea]
free (disponible nuevamente)
```

---

**Status**: ✅ Sistema implementado y funcional
**Scripts**: `generate_slots.py` listo para uso
**Next**: Crear endpoints REST API para slots
