# Seed Conditions - Catálogo de Condiciones Médicas

## Descripción

Este script proporciona un catálogo de referencia de **60+ condiciones médicas comunes** organizadas por categoría, con códigos ICD-10 y SNOMED CT.

## Contenido

### Categorías Incluidas

1. **Cardiovascular** (5 condiciones)
   - Hipertensión Arterial
   - Insuficiencia Cardíaca
   - Fibrilación Auricular
   - Enfermedad Coronaria
   - Infarto Agudo de Miocardio

2. **Endocrino/Metabólico** (6 condiciones)
   - Diabetes Mellitus Tipo 1 y 2
   - Hipotiroidismo/Hipertiroidismo
   - Obesidad
   - Dislipidemia

3. **Respiratorio** (4 condiciones)
   - Asma Bronquial
   - EPOC
   - Apnea Obstructiva del Sueño
   - Neumonía

4. **Gastrointestinal** (7 condiciones)
   - ERGE (Reflujo)
   - Gastritis Crónica
   - Síndrome de Intestino Irritable
   - Enfermedad de Crohn
   - Colitis Ulcerosa
   - Hepatitis C Crónica
   - Cirrosis Hepática

5. **Neurológico** (6 condiciones)
   - Epilepsia
   - Enfermedad de Parkinson
   - Enfermedad de Alzheimer
   - Esclerosis Múltiple
   - Migraña
   - ACV (Accidente Cerebrovascular)

6. **Musculoesquelético** (5 condiciones)
   - Artritis Reumatoide
   - Osteoartritis
   - Osteoporosis
   - Fibromialgia
   - Lumbalgia Crónica

7. **Renal/Urológico** (3 condiciones)
   - Enfermedad Renal Crónica
   - Infección Urinaria Recurrente
   - Litiasis Renal

8. **Psiquiátrico** (5 condiciones)
   - Trastorno Depresivo Mayor
   - Trastorno de Ansiedad Generalizada
   - Trastorno Bipolar
   - Trastorno de Pánico
   - TOC (Trastorno Obsesivo Compulsivo)

9. **Dermatológico** (3 condiciones)
   - Psoriasis
   - Dermatitis Atópica (Eczema)
   - Rosácea

10. **Hematológico** (3 condiciones)
    - Anemia Ferropénica
    - Anemia Perniciosa
    - Leucemia

11. **Oncológico** (4 condiciones)
    - Cáncer de Mama
    - Cáncer de Próstata
    - Cáncer de Pulmón
    - Cáncer Colorrectal

12. **Enfermedades Infecciosas** (2 condiciones)
    - VIH/SIDA
    - Tuberculosis

13. **Oftalmológico** (3 condiciones)
    - Glaucoma
    - Cataratas
    - Degeneración Macular

14. **Otras** (2 condiciones)
    - Hipoacusia
    - Síndrome Metabólico

## Estructura de Datos

Cada condición incluye:

```python
{
    'name': 'Nombre de la condición',
    'icd10_code': 'Código ICD-10',
    'snomed_code': 'Código SNOMED CT',
    'category': 'Categoría de la condición',
    'typical_severity': 'mild | moderate | severe',
    'chronic': True/False,
    'description': 'Descripción breve de la condición'
}
```

## Uso

### Ejecutar el Script Directamente

```bash
cd backend
python seed_conditions.py
```

### Como Parte del Reset de Base de Datos

El script se ejecuta automáticamente cuando se resetea la base de datos:

```bash
cd backend
python reset_db.py
```

## Códigos de Clasificación

### ICD-10 (International Classification of Diseases)
- Sistema de clasificación internacional de enfermedades
- Utilizado para codificación diagnóstica y facturación
- Ejemplo: `E11.9` = Diabetes Mellitus Tipo 2

### SNOMED CT (Systematized Nomenclature of Medicine - Clinical Terms)
- Terminología clínica estandarizada
- Más granular y específica que ICD-10
- Ejemplo: `44054006` = Diabetes Mellitus Tipo 2

## Nota Importante

⚠️ **Este script NO crea una tabla de catálogo separada** como `allergies` o `medications`. 

En su lugar:
- Proporciona datos de referencia para condiciones comunes
- Los datos están disponibles en `CONDITIONS_DATA` para consulta
- Las condiciones específicas de pacientes se almacenan en `patient_conditions`

Si en el futuro deseas crear una tabla de catálogo `conditions`, puedes:

1. Crear el modelo `Condition` (similar a `Allergy` o `Medication`)
2. Modificar este script para insertar datos en esa tabla
3. Relacionar `patient_conditions` con el catálogo mediante foreign key

## Integración con `patient_conditions`

Los datos de este catálogo sirven como referencia para:
- Autocompletado en formularios
- Validación de códigos ICD-10/SNOMED CT
- Información de severidad típica
- Clasificación por categorías
- Identificación de condiciones crónicas vs agudas

## Ejemplo de Uso en la Aplicación

```python
# Buscar condición por nombre
diabetes = next((c for c in CONDITIONS_DATA if 'Diabetes Tipo 2' in c['name']), None)

# Obtener código ICD-10
icd10_code = diabetes['icd10_code']  # 'E11.9'

# Crear condición de paciente
new_condition = PatientCondition(
    patient_id=patient.id,
    condition_name=diabetes['name'],
    condition_code=diabetes['icd10_code'],
    condition_system='ICD-10',
    clinical_status='active',
    severity=diabetes['typical_severity'],
    # ... otros campos
)
```

## Mantenimiento

Para agregar nuevas condiciones:

1. Abre `seed_conditions.py`
2. Añade la nueva condición a `CONDITIONS_DATA` en la categoría apropiada
3. Asegúrate de incluir todos los campos requeridos
4. Ejecuta el script para verificar

## Recursos

- [ICD-10 Browser](https://icd.who.int/browse10/2019/en)
- [SNOMED CT Browser](https://browser.ihtsdotools.org/)
- [CIE-10 en español](https://eciemaps.mscbs.gob.es/ecieMaps/browser/index_10_mc.html)

---

**Última actualización**: Noviembre 2025
**Total de condiciones**: 60+
**Categorías**: 14
