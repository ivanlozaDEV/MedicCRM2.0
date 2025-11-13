# Sistema de Diseño - DoctorCRM 2.0

## Filosofía de Diseño

El sistema de diseño de DoctorCRM 2.0 está basado en **claridad, profesionalismo y consistencia**. Evitamos el uso excesivo de colores y priorizamos la legibilidad y la jerarquía visual clara.

### Principios Clave

1. **Fondo Blanco Predominante**: Usamos fondos blancos para las cards y secciones principales
2. **Colores Semánticos**: Los colores se usan solo con propósito específico (acciones, estados, categorías)
3. **Jerarquía Visual Clara**: Textos con tamaños y pesos consistentes
4. **Espaciado Consistente**: Padding y gaps uniformes
5. **Sombras Sutiles**: Para dar profundidad sin saturar

---

## 🎨 Paleta de Colores

### Colores Funcionales

#### Acciones Primarias
- **Crear/Agregar**: `bg-blue-600 hover:bg-blue-700` (Botones principales)
- **Ver/Visualizar**: `text-gray-600 hover:bg-gray-100` (Iconos de vista)
- **Editar**: `text-blue-600 hover:bg-blue-50` (Iconos de edición)
- **Eliminar**: `text-red-600 hover:bg-red-50` (Iconos de eliminación)
- **Confirmar/Resolver**: `text-green-600 hover:bg-green-50` (Acciones positivas)

#### Colores Temáticos (Solo para íconos y badges)
- **Azul** (`blue-600`): Contactos, información personal
- **Rojo** (`red-600`): Alergias, información médica crítica
- **Índigo** (`indigo-600`): Medicamentos
- **Púrpura** (`purple-600`): Condiciones médicas, identificación
- **Verde** (`green-600`): Contacto, éxito, resolución
- **Ámbar** (`amber-600`): Advertencias, información adicional

---

## 📦 Componentes

### 1. Cards/Secciones Blancas

**Uso**: Para mostrar información agrupada (datos de paciente, items en listas)

```tsx
<div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
  {/* Contenido */}
</div>
```

**Propiedades**:
- Fondo: `bg-white`
- Borde: `border border-gray-200`
- Redondeo: `rounded-lg`
- Padding: `p-6` (secciones grandes) o `p-4` (cards pequeñas)
- Sombra: `shadow-sm` + `hover:shadow-md` (opcional)
- Transición: `transition-shadow` (para hover)

---

### 2. Encabezados de Sección

**Uso**: Títulos principales de secciones o cards

```tsx
<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
  <IconComponent className="h-5 w-5 mr-2 text-blue-600" />
  Título de la Sección
</h3>
```

**Propiedades**:
- Texto: `text-lg font-medium text-gray-900`
- Margen inferior: `mb-4`
- Layout: `flex items-center` (si incluye ícono)
- Ícono: `h-5 w-5 mr-2` con color temático

---

### 3. Jerarquía de Texto

#### Títulos de Card/Item
```tsx
<h4 className="text-lg font-medium text-gray-900">
  Nombre del Item
</h4>
```

#### Labels (Etiquetas de campos)
```tsx
<dt className="text-sm font-medium text-gray-700">
  Etiqueta
</dt>
```

#### Contenido/Valores
```tsx
<dd className="mt-1 text-sm text-gray-900">
  Valor del campo
</dd>
```

#### Metadatos (información secundaria)
```tsx
<span className="text-xs text-gray-600">
  Información secundaria
</span>
```

#### Notas/Observaciones
```tsx
<p className="text-xs text-gray-500 italic">
  Nota o comentario adicional
</p>
```

#### Valores Vacíos
```tsx
<span className="text-gray-400 italic">
  No especificado
</span>
```

---

### 4. Botones

#### Botón Primario (Crear/Agregar)
```tsx
<button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
  <PlusIcon className="h-5 w-5 mr-2" />
  Agregar Item
</button>
```

#### Botones de Acción (Iconos)

**Ver/Visualizar** (gris neutro):
```tsx
<button 
  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
  title="Ver detalles"
>
  <EyeIcon className="h-4 w-4" />
</button>
```

**Editar** (azul):
```tsx
<button 
  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
  title="Editar"
>
  <PencilIcon className="h-4 w-4" />
</button>
```

**Eliminar** (rojo):
```tsx
<button 
  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
  title="Eliminar"
>
  <TrashIcon className="h-4 w-4" />
</button>
```

**Acción Positiva** (verde - ej: marcar como resuelto):
```tsx
<button 
  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
  title="Confirmar"
>
  <CheckCircleIcon className="h-4 w-4" />
</button>
```

#### Grupo de Botones de Acción
```tsx
<div className="flex items-center space-x-2 ml-4">
  {/* Botón Ver */}
  {/* Botón Editar */}
  {/* Botón Eliminar */}
</div>
```

---

### 5. Badges (Etiquetas de Estado)

#### Badge Estándar
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-{color}-100 text-{color}-800">
  Texto
</span>
```

**Ejemplos por contexto**:

**Severidad Alta/Crítica**:
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
  Crítico
</span>
```

**Estado Activo**:
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Activo
</span>
```

**Información/Neutral**:
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  Info
</span>
```

**Advertencia**:
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
  Advertencia
</span>
```

---

### 6. Listas de Definición (dl/dt/dd)

**Uso**: Para mostrar pares label-valor de forma estructurada

```tsx
<dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
  <div>
    <dt className="text-sm font-medium text-gray-700">Label</dt>
    <dd className="mt-1 text-sm text-gray-900">Valor</dd>
  </div>
  <div>
    <dt className="text-sm font-medium text-gray-700">Otro Label</dt>
    <dd className="mt-1 text-sm text-gray-900">Otro Valor</dd>
  </div>
</dl>
```

**Para campo que ocupa todo el ancho**:
```tsx
<div className="sm:col-span-2">
  <dt className="text-sm font-medium text-gray-700">Label Completo</dt>
  <dd className="mt-1 text-sm text-gray-900">Valor largo que necesita más espacio</dd>
</div>
```

---

### 7. Estados Vacíos

```tsx
<div className="text-center py-12">
  <IconComponent className="mx-auto h-12 w-12 text-gray-400" />
  <h3 className="mt-2 text-sm font-medium text-gray-900">Sin {items}</h3>
  <p className="mt-1 text-sm text-gray-500">
    Comienza agregando un nuevo {item}.
  </p>
  <div className="mt-6">
    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
      <PlusIcon className="h-5 w-5 mr-2" />
      Agregar {Item}
    </button>
  </div>
</div>
```

---

### 8. Íconos de Estado

**Uso**: Para mostrar estado visual en secciones (ej: condiciones activas/resueltas)

```tsx
// Activo/Positivo
<CheckCircleIcon className="h-5 w-5 text-green-600" />

// Resuelto/Completado
<CheckCircleIcon className="h-5 w-5 text-gray-400" />

// Advertencia
<ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />

// Error/Crítico
<XCircleIcon className="h-5 w-5 text-red-600" />

// Información
<InformationCircleIcon className="h-5 w-5 text-blue-600" />
```

---

## 📏 Espaciado y Layout

### Espaciado entre Secciones
```tsx
<div className="space-y-6">
  {/* Secciones con 1.5rem (24px) de espacio vertical */}
</div>
```

### Espaciado entre Cards en Grid
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* Cards con 1rem (16px) de gap */}
</div>
```

### Espaciado Interno de Cards
- **Secciones grandes**: `p-6` (1.5rem / 24px)
- **Cards medianas**: `p-4` (1rem / 16px)
- **Cards pequeñas**: `p-3` (0.75rem / 12px)

---

## 🎯 Patrones de Uso

### Patrón: Tab de Información del Paciente

```tsx
export default function InformationTab() {
  return (
    <div className="space-y-6">
      {/* Header con título y botón de acción */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Título del Tab
        </h3>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          <PlusIcon className="h-5 w-5 mr-2" />
          Agregar
        </button>
      </div>

      {/* Lista de items */}
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-900 mt-1">
                  {item.description}
                </p>
              </div>
              
              {/* Botones de acción */}
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Patrón: Sección de Información Estática

```tsx
<div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
    <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
    Información Personal
  </h3>
  
  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
    <div>
      <dt className="text-sm font-medium text-gray-700">Nombre Completo</dt>
      <dd className="mt-1 text-sm text-gray-900">{fullName}</dd>
    </div>
    <div>
      <dt className="text-sm font-medium text-gray-700">Fecha de Nacimiento</dt>
      <dd className="mt-1 text-sm text-gray-900">{dateOfBirth}</dd>
    </div>
  </dl>
</div>
```

---

## ❌ Anti-patrones (Evitar)

### ❌ NO usar fondos de colores en cards/secciones
```tsx
// MAL ❌
<div className="bg-blue-50 border-blue-200">
  {/* contenido */}
</div>

// BIEN ✅
<div className="bg-white border-gray-200">
  <IconComponent className="text-blue-600" />
  {/* contenido */}
</div>
```

### ❌ NO usar diferentes colores para botones primarios
```tsx
// MAL ❌
<button className="bg-red-600">Agregar Alergia</button>
<button className="bg-purple-600">Agregar Condición</button>

// BIEN ✅
<button className="bg-blue-600">Agregar Alergia</button>
<button className="bg-blue-600">Agregar Condición</button>
```

### ❌ NO mezclar estilos de texto
```tsx
// MAL ❌
<h3 className="text-xl font-bold text-blue-900">Título 1</h3>
<h3 className="text-lg font-semibold text-gray-800">Título 2</h3>

// BIEN ✅
<h3 className="text-lg font-medium text-gray-900">Título 1</h3>
<h3 className="text-lg font-medium text-gray-900">Título 2</h3>
```

### ❌ NO usar colores temáticos en botones de acción
```tsx
// MAL ❌
<button className="text-red-600">Ver alergia</button>
<button className="text-purple-600">Ver condición</button>

// BIEN ✅
<button className="text-gray-600">Ver alergia</button>
<button className="text-gray-600">Ver condición</button>
```

---

## 📱 Responsive Design

### Breakpoints de Tailwind
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Patrones Responsive

#### Grid Adaptativo
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* Se adapta: 1 col móvil, 2 cols tablet, 3 cols desktop */}
</div>
```

#### Listas de Definición
```tsx
<dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
  {/* 1 columna en móvil, 2 en tablet+ */}
</dl>
```

---

## 🔄 Animaciones y Transiciones

### Hover en Cards
```tsx
<div className="hover:shadow-md transition-shadow">
```

### Hover en Botones
```tsx
<button className="transition-colors">
```

### Transiciones Estándar
- `transition-shadow`: Para cambios de sombra
- `transition-colors`: Para cambios de color
- `transition-all`: Solo cuando necesites múltiples propiedades

**Duración**: Usar las duraciones por defecto de Tailwind (generalmente 150ms)

---

## 📋 Checklist de Implementación

Cuando crees un nuevo componente o sección, verifica:

- [ ] ¿Usa fondo blanco (`bg-white`) para cards/secciones?
- [ ] ¿Los colores se usan solo en íconos y badges, no en fondos?
- [ ] ¿El botón principal es azul (`bg-blue-600`)?
- [ ] ¿Los botones de acción siguen el patrón de colores (ver=gris, editar=azul, eliminar=rojo)?
- [ ] ¿La jerarquía de texto es consistente (títulos=lg, labels=sm medium gray-700, valores=sm gray-900)?
- [ ] ¿Usa `space-y-6` entre secciones y `gap-4` en grids?
- [ ] ¿Tiene estados de hover apropiados?
- [ ] ¿Es responsive (grid adapta columnas según breakpoint)?
- [ ] ¿Los estados vacíos tienen mensaje claro y botón de acción?
- [ ] ¿Evita dark mode classes innecesarias?

---

## 🎨 Ejemplo Completo: Nueva Sección

```tsx
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { DocumentIcon } from '@heroicons/react/24/outline'

export default function NewSectionTab() {
  const items = [] // tus datos

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin items</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza agregando un nuevo item.
        </p>
        <div className="mt-6">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-5 w-5 mr-2" />
            Agregar Item
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Mi Nueva Sección
        </h3>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <PlusIcon className="h-5 w-5 mr-2" />
          Agregar Item
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">
                  {item.title}
                </h4>
                
                <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-700">Campo 1</dt>
                    <dd className="mt-1 text-sm text-gray-900">{item.field1}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-700">Campo 2</dt>
                    <dd className="mt-1 text-sm text-gray-900">{item.field2}</dd>
                  </div>
                </dl>
              </div>
              
              {/* Acciones */}
              <div className="flex items-center space-x-2 ml-4">
                <button 
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                  title="Ver detalles"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button 
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Editar"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button 
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  title="Eliminar"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 📚 Referencias

- Iconos: [Heroicons](https://heroicons.com/)
- Colores: [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- Componentes base inspirados en: [Tailwind UI](https://tailwindui.com/)

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
