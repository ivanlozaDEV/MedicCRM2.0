# Models Documentation

Este directorio contiene todos los modelos de la base de datos organizados de manera modular.

## Estructura

Cada tabla de la base de datos está en su propio archivo para mejor organización y mantenibilidad.

```
models/
├── __init__.py              # Inicialización de SQLAlchemy y exportaciones
├── organization.py          # Modelo de Organizaciones/Clínicas
└── (más modelos por venir)
```

## Modelos Actuales

### 1. Organization (organizations)
Representa las organizaciones o clínicas que usan el sistema.

**Campos principales:**
- `name`: Nombre de la organización
- `legal_name`: Nombre legal
- `tax_id`: RUC o identificación fiscal
- `email`, `phone`, `website`: Información de contacto
- Dirección completa (address_line1, city, state, etc.)
- Configuración (timezone, currency)
- Branding (logo_url, primary_color)

**Métodos:**
- `to_dict()`: Convierte a diccionario JSON
- `create()`: Crea una nueva organización
- `update()`: Actualiza datos
- `delete()`: Soft delete (marca como inactiva)
- `hard_delete()`: Elimina permanentemente

## Uso

### Importar modelos:
```python
from models import db, Organization
```

### Crear una organización:
```python
org = Organization.create(
    name="Clínica Ejemplo",
    email="contacto@ejemplo.com",
    phone="+593 99 123 4567",
    city="Quito",
    country="Ecuador"
)
```

### Consultar organizaciones:
```python
# Todas las organizaciones activas
orgs = Organization.query.filter_by(is_active=True).all()

# Por ID
org = Organization.query.get(1)

# Por nombre
org = Organization.query.filter_by(name="Clínica Ejemplo").first()
```

### Actualizar:
```python
org = Organization.query.get(1)
org.update(
    phone="+593 99 999 9999",
    website="https://ejemplo.com"
)
```

### Eliminar (soft delete):
```python
org = Organization.query.get(1)
org.delete()  # Marca is_active = False
```

## Próximos Modelos

Los siguientes modelos serán agregados progresivamente:
- [ ] Users (usuarios del sistema)
- [ ] Patients (pacientes)
- [ ] Doctors (médicos)
- [ ] Appointments (citas)
- [ ] Medical Records (historias clínicas)
- [ ] Invoices (facturas)
- [ ] Payments (pagos)
- Y más...

## Migraciones

Para crear las tablas en la base de datos:

```bash
cd backend
source .venv/bin/activate
python create_tables.py
```

## Convenciones

1. **Nombres de archivos**: snake_case (ej: `organization.py`)
2. **Nombres de clases**: PascalCase (ej: `Organization`)
3. **Nombres de tablas**: plural snake_case (ej: `organizations`)
4. **Timestamps**: Siempre incluir `created_at` y `updated_at`
5. **Soft deletes**: Usar `is_active` para marcar registros activos/inactivos
6. **Métodos helper**: Incluir `to_dict()`, `create()`, `update()`, `delete()`
