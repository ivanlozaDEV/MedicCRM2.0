# Database Reset Scripts

Scripts para resetear la base de datos del proyecto DoctorCRM.

## ⚠️ ADVERTENCIA

Estos scripts **ELIMINARÁN TODOS LOS DATOS** de la base de datos. Úsalos con precaución.

## Scripts Disponibles

### 1. `reset_db.py` (Python)

Script Python que usa SQLAlchemy para hacer DROP y CREATE de todas las tablas.

**Uso:**
```bash
cd backend
source .venv/bin/activate
python reset_db.py
```

**Qué hace:**
1. Solicita confirmación (debes escribir "yes")
2. Ejecuta `db.drop_all()` para eliminar todas las tablas
3. Ejecuta `db.create_all()` para recrear las tablas desde los modelos
4. Muestra un resumen de las tablas creadas

### 2. `reset_db.sh` (Bash wrapper)

Script Bash que automatiza la activación del entorno virtual y ejecución del script Python.

**Uso:**
```bash
cd backend
./reset_db.sh
```

**Qué hace:**
1. Verifica que exista el virtual environment
2. Activa el virtual environment automáticamente
3. Ejecuta el script Python
4. Desactiva el virtual environment

## Tablas que se Resetean

El script recrea las siguientes tablas:

- `organizations` - Organizaciones (clínicas, consultorios)
- `users` - Usuarios del sistema
- `subscriptions` - Planes de suscripción
- `roles` - Roles del sistema
- `permissions` - Permisos disponibles
- `role_permissions` - Relación roles-permisos
- `specialties` - Especialidades médicas
- `user_specialties` - Relación usuarios-especialidades

## Ejemplo de Uso Completo

```bash
# Ir al directorio backend
cd /Users/ivanloza/Documents/DoctorCRM2.0/backend

# Opción 1: Usar el script bash (más fácil)
./reset_db.sh

# Opción 2: Usar el script Python directamente
source .venv/bin/activate
python reset_db.py
deactivate
```

## Flujo de Confirmación

```
==============================================================
DATABASE RESET SCRIPT
==============================================================

⚠️  WARNING: This will DELETE ALL DATA in the database!
Database: sqlite:///instance/doctorcrm.db

Are you sure you want to continue? (type 'yes' to confirm): yes

🗑️  Dropping all tables...
✅ All tables dropped successfully

🔨 Creating all tables...
✅ All tables created successfully

==============================================================
✅ DATABASE RESET COMPLETE
==============================================================

Tables created:
  - organizations
  - users
  - subscriptions
  - roles
  - permissions
  - role_permissions
  - specialties
  - user_specialties

✨ Database is now clean and ready to use!
==============================================================
```

## Notas Importantes

1. **Backup de Datos**: Si tienes datos importantes, haz un backup antes de resetear
2. **Confirmación Requerida**: El script requiere que escribas "yes" para continuar
3. **Sin Seeding**: Estos scripts NO insertan datos de prueba, solo crean tablas vacías
4. **Desarrollo Only**: Usa estos scripts solo en desarrollo, nunca en producción

## Próximos Pasos Después del Reset

Después de resetear la base de datos, puedes:

1. **Usar la API de Signup** para crear tu primera organización y usuario admin
2. **Crear datos manualmente** a través del frontend
3. **Agregar un script de seeding** (próximamente) para datos de prueba

## Troubleshooting

### Error: "Virtual environment not found"
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Error: "No module named 'app'"
Asegúrate de estar en el directorio `backend` cuando ejecutes el script.

### Error de permisos
```bash
chmod +x reset_db.py
chmod +x reset_db.sh
```
