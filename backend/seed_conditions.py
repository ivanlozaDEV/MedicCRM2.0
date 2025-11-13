"""
Seed script for Conditions catalog.
Populates the conditions table with common medical conditions organized by category.
"""

from app import app
from models import db
from models.condition import Condition

# Common medical conditions data with ICD-10 and SNOMED CT codes
CONDITIONS_DATA = [
    # CARDIOVASCULAR CONDITIONS
    {
        'name': 'Hipertensión Arterial',
        'icd10_code': 'I10',
        'snomed_code': '38341003',
        'category': 'cardiovascular',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Presión arterial elevada de forma persistente'
    },
    {
        'name': 'Insuficiencia Cardíaca',
        'icd10_code': 'I50.9',
        'snomed_code': '84114007',
        'category': 'cardiovascular',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Incapacidad del corazón para bombear sangre adecuadamente'
    },
    {
        'name': 'Fibrilación Auricular',
        'icd10_code': 'I48.91',
        'snomed_code': '49436004',
        'category': 'cardiovascular',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Arritmia cardíaca con latido irregular'
    },
    {
        'name': 'Enfermedad Coronaria',
        'icd10_code': 'I25.10',
        'snomed_code': '53741008',
        'category': 'cardiovascular',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Reducción del flujo sanguíneo al músculo cardíaco'
    },
    {
        'name': 'Infarto Agudo de Miocardio',
        'icd10_code': 'I21.9',
        'snomed_code': '57054005',
        'category': 'cardiovascular',
        'typical_severity': 'severe',
        'chronic': False,
        'description': 'Ataque cardíaco, muerte del tejido cardíaco'
    },
    
    # ENDOCRINE/METABOLIC CONDITIONS
    {
        'name': 'Diabetes Mellitus Tipo 2',
        'icd10_code': 'E11.9',
        'snomed_code': '44054006',
        'category': 'endocrine',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Resistencia a la insulina y elevación de glucosa en sangre'
    },
    {
        'name': 'Diabetes Mellitus Tipo 1',
        'icd10_code': 'E10.9',
        'snomed_code': '46635009',
        'category': 'endocrine',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Deficiencia absoluta de insulina'
    },
    {
        'name': 'Hipotiroidismo',
        'icd10_code': 'E03.9',
        'snomed_code': '40930008',
        'category': 'endocrine',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Producción insuficiente de hormona tiroidea'
    },
    {
        'name': 'Hipertiroidismo',
        'icd10_code': 'E05.90',
        'snomed_code': '34486009',
        'category': 'endocrine',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Producción excesiva de hormona tiroidea'
    },
    {
        'name': 'Obesidad',
        'icd10_code': 'E66.9',
        'snomed_code': '414915002',
        'category': 'metabolic',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Exceso de grasa corporal con IMC ≥30'
    },
    {
        'name': 'Dislipidemia',
        'icd10_code': 'E78.5',
        'snomed_code': '370992007',
        'category': 'metabolic',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Alteración de los niveles de lípidos en sangre'
    },
    
    # RESPIRATORY CONDITIONS
    {
        'name': 'Asma Bronquial',
        'icd10_code': 'J45.909',
        'snomed_code': '195967001',
        'category': 'respiratory',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Inflamación crónica de las vías respiratorias'
    },
    {
        'name': 'EPOC (Enfermedad Pulmonar Obstructiva Crónica)',
        'icd10_code': 'J44.9',
        'snomed_code': '13645005',
        'category': 'respiratory',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Obstrucción crónica del flujo de aire en los pulmones'
    },
    {
        'name': 'Apnea Obstructiva del Sueño',
        'icd10_code': 'G47.33',
        'snomed_code': '78275009',
        'category': 'respiratory',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Pausas respiratorias durante el sueño'
    },
    {
        'name': 'Neumonía',
        'icd10_code': 'J18.9',
        'snomed_code': '233604007',
        'category': 'respiratory',
        'typical_severity': 'severe',
        'chronic': False,
        'description': 'Infección pulmonar aguda'
    },
    
    # GASTROINTESTINAL CONDITIONS
    {
        'name': 'Enfermedad por Reflujo Gastroesofágico (ERGE)',
        'icd10_code': 'K21.9',
        'snomed_code': '235595009',
        'category': 'gastrointestinal',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Reflujo crónico de ácido estomacal'
    },
    {
        'name': 'Gastritis Crónica',
        'icd10_code': 'K29.50',
        'snomed_code': '40275004',
        'category': 'gastrointestinal',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Inflamación crónica del revestimiento del estómago'
    },
    {
        'name': 'Síndrome de Intestino Irritable',
        'icd10_code': 'K58.9',
        'snomed_code': '10743008',
        'category': 'gastrointestinal',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Trastorno funcional intestinal crónico'
    },
    {
        'name': 'Enfermedad de Crohn',
        'icd10_code': 'K50.90',
        'snomed_code': '34000006',
        'category': 'gastrointestinal',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Enfermedad inflamatoria intestinal crónica'
    },
    {
        'name': 'Colitis Ulcerosa',
        'icd10_code': 'K51.90',
        'snomed_code': '64766004',
        'category': 'gastrointestinal',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Inflamación crónica del colon'
    },
    {
        'name': 'Hepatitis C Crónica',
        'icd10_code': 'B18.2',
        'snomed_code': '50711007',
        'category': 'gastrointestinal',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Infección crónica por virus de hepatitis C'
    },
    {
        'name': 'Cirrosis Hepática',
        'icd10_code': 'K74.60',
        'snomed_code': '19943007',
        'category': 'gastrointestinal',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Cicatrización avanzada del hígado'
    },
    
    # NEUROLOGICAL CONDITIONS
    {
        'name': 'Epilepsia',
        'icd10_code': 'G40.909',
        'snomed_code': '84757009',
        'category': 'neurological',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Trastorno neurológico con crisis convulsivas recurrentes'
    },
    {
        'name': 'Enfermedad de Parkinson',
        'icd10_code': 'G20',
        'snomed_code': '49049000',
        'category': 'neurological',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Trastorno neurodegenerativo del movimiento'
    },
    {
        'name': 'Enfermedad de Alzheimer',
        'icd10_code': 'G30.9',
        'snomed_code': '26929004',
        'category': 'neurological',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Demencia neurodegenerativa progresiva'
    },
    {
        'name': 'Esclerosis Múltiple',
        'icd10_code': 'G35',
        'snomed_code': '24700007',
        'category': 'neurological',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Enfermedad autoinmune desmielinizante del sistema nervioso'
    },
    {
        'name': 'Migraña',
        'icd10_code': 'G43.909',
        'snomed_code': '37796009',
        'category': 'neurological',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Cefalea recurrente con características específicas'
    },
    {
        'name': 'Accidente Cerebrovascular (ACV)',
        'icd10_code': 'I63.9',
        'snomed_code': '230690007',
        'category': 'neurological',
        'typical_severity': 'severe',
        'chronic': False,
        'description': 'Evento cerebrovascular agudo'
    },
    
    # MUSCULOSKELETAL CONDITIONS
    {
        'name': 'Artritis Reumatoide',
        'icd10_code': 'M06.9',
        'snomed_code': '69896004',
        'category': 'musculoskeletal',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Enfermedad autoinmune inflamatoria de las articulaciones'
    },
    {
        'name': 'Osteoartritis',
        'icd10_code': 'M19.90',
        'snomed_code': '396275006',
        'category': 'musculoskeletal',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Degeneración articular por desgaste'
    },
    {
        'name': 'Osteoporosis',
        'icd10_code': 'M81.0',
        'snomed_code': '64859006',
        'category': 'musculoskeletal',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Disminución de la densidad ósea'
    },
    {
        'name': 'Fibromialgia',
        'icd10_code': 'M79.7',
        'snomed_code': '203082005',
        'category': 'musculoskeletal',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Dolor musculoesquelético crónico generalizado'
    },
    {
        'name': 'Lumbalgia Crónica',
        'icd10_code': 'M54.5',
        'snomed_code': '279039007',
        'category': 'musculoskeletal',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Dolor crónico en la región lumbar'
    },
    
    # RENAL/UROLOGICAL CONDITIONS
    {
        'name': 'Enfermedad Renal Crónica',
        'icd10_code': 'N18.9',
        'snomed_code': '709044004',
        'category': 'renal',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Pérdida progresiva de la función renal'
    },
    {
        'name': 'Infección Urinaria Recurrente',
        'icd10_code': 'N39.0',
        'snomed_code': '68566005',
        'category': 'renal',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Infecciones del tracto urinario repetidas'
    },
    {
        'name': 'Litiasis Renal',
        'icd10_code': 'N20.0',
        'snomed_code': '95570007',
        'category': 'renal',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Cálculos en el riñón'
    },
    
    # PSYCHIATRIC/MENTAL HEALTH CONDITIONS
    {
        'name': 'Trastorno Depresivo Mayor',
        'icd10_code': 'F32.9',
        'snomed_code': '370143000',
        'category': 'psychiatric',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Depresión clínica persistente'
    },
    {
        'name': 'Trastorno de Ansiedad Generalizada',
        'icd10_code': 'F41.1',
        'snomed_code': '21897009',
        'category': 'psychiatric',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Ansiedad persistente y excesiva'
    },
    {
        'name': 'Trastorno Bipolar',
        'icd10_code': 'F31.9',
        'snomed_code': '13746004',
        'category': 'psychiatric',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Trastorno del estado de ánimo con episodios maníacos y depresivos'
    },
    {
        'name': 'Trastorno de Pánico',
        'icd10_code': 'F41.0',
        'snomed_code': '371631005',
        'category': 'psychiatric',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Ataques de pánico recurrentes e inesperados'
    },
    {
        'name': 'Trastorno Obsesivo Compulsivo (TOC)',
        'icd10_code': 'F42.2',
        'snomed_code': '191736004',
        'category': 'psychiatric',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Obsesiones y compulsiones persistentes'
    },
    
    # DERMATOLOGICAL CONDITIONS
    {
        'name': 'Psoriasis',
        'icd10_code': 'L40.9',
        'snomed_code': '9014002',
        'category': 'dermatological',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Enfermedad inflamatoria crónica de la piel'
    },
    {
        'name': 'Dermatitis Atópica (Eczema)',
        'icd10_code': 'L20.9',
        'snomed_code': '24079001',
        'category': 'dermatological',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Inflamación crónica de la piel con picazón'
    },
    {
        'name': 'Rosácea',
        'icd10_code': 'L71.9',
        'snomed_code': '398909004',
        'category': 'dermatological',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Afección inflamatoria crónica de la piel facial'
    },
    
    # HEMATOLOGICAL CONDITIONS
    {
        'name': 'Anemia Ferropénica',
        'icd10_code': 'D50.9',
        'snomed_code': '87522002',
        'category': 'hematological',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Anemia por deficiencia de hierro'
    },
    {
        'name': 'Anemia Perniciosa',
        'icd10_code': 'D51.0',
        'snomed_code': '84027009',
        'category': 'hematological',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Anemia por deficiencia de vitamina B12'
    },
    {
        'name': 'Leucemia',
        'icd10_code': 'C95.90',
        'snomed_code': '93143009',
        'category': 'oncological',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Cáncer de las células sanguíneas'
    },
    
    # ONCOLOGICAL CONDITIONS
    {
        'name': 'Cáncer de Mama',
        'icd10_code': 'C50.919',
        'snomed_code': '254837009',
        'category': 'oncological',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Neoplasia maligna de la mama'
    },
    {
        'name': 'Cáncer de Próstata',
        'icd10_code': 'C61',
        'snomed_code': '399068003',
        'category': 'oncological',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Neoplasia maligna de la próstata'
    },
    {
        'name': 'Cáncer de Pulmón',
        'icd10_code': 'C34.90',
        'snomed_code': '93880001',
        'category': 'oncological',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Neoplasia maligna del pulmón'
    },
    {
        'name': 'Cáncer Colorrectal',
        'icd10_code': 'C18.9',
        'snomed_code': '363406005',
        'category': 'oncological',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Neoplasia maligna del colon o recto'
    },
    
    # INFECTIOUS DISEASES
    {
        'name': 'VIH/SIDA',
        'icd10_code': 'B20',
        'snomed_code': '86406008',
        'category': 'infectious',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Infección por virus de inmunodeficiencia humana'
    },
    {
        'name': 'Tuberculosis',
        'icd10_code': 'A15.9',
        'snomed_code': '56717001',
        'category': 'infectious',
        'typical_severity': 'severe',
        'chronic': False,
        'description': 'Infección bacteriana por Mycobacterium tuberculosis'
    },
    
    # OPHTHALMOLOGICAL CONDITIONS
    {
        'name': 'Glaucoma',
        'icd10_code': 'H40.9',
        'snomed_code': '23986001',
        'category': 'ophthalmological',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Aumento de la presión intraocular'
    },
    {
        'name': 'Cataratas',
        'icd10_code': 'H25.9',
        'snomed_code': '193570009',
        'category': 'ophthalmological',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Opacidad del cristalino del ojo'
    },
    {
        'name': 'Degeneración Macular',
        'icd10_code': 'H35.30',
        'snomed_code': '422338006',
        'category': 'ophthalmological',
        'typical_severity': 'severe',
        'chronic': True,
        'description': 'Deterioro de la mácula con pérdida de visión central'
    },
    
    # OTHER COMMON CONDITIONS
    {
        'name': 'Hipoacusia (Pérdida Auditiva)',
        'icd10_code': 'H91.90',
        'snomed_code': '343087000',
        'category': 'otological',
        'typical_severity': 'mild',
        'chronic': True,
        'description': 'Disminución de la capacidad auditiva'
    },
    {
        'name': 'Síndrome Metabólico',
        'icd10_code': 'E88.81',
        'snomed_code': '237602007',
        'category': 'metabolic',
        'typical_severity': 'moderate',
        'chronic': True,
        'description': 'Conjunto de condiciones que aumentan riesgo cardiovascular'
    },
]


def seed_conditions(auto_skip=True):
    """
    Seed common medical conditions into the conditions catalog table.
    
    Args:
        auto_skip (bool): If True, skip seeding if conditions already exist.
    """
    print("\n🔄 Seeding Conditions Catalog...")
    
    # Check if conditions already exist
    existing_count = Condition.query.count()
    if auto_skip and existing_count > 0:
        print(f"⏭️  Conditions already seeded ({existing_count} conditions found). Skipping...")
        return
    
    # Insert conditions into database
    conditions_created = 0
    for condition_data in CONDITIONS_DATA:
        try:
            # Check if condition already exists
            existing = Condition.query.filter_by(name=condition_data['name']).first()
            if not existing:
                condition = Condition(
                    name=condition_data['name'],
                    description=condition_data.get('description'),
                    icd10_code=condition_data.get('icd10_code'),
                    snomed_code=condition_data.get('snomed_code'),
                    category=condition_data.get('category'),
                    typical_severity=condition_data.get('typical_severity'),
                    is_chronic=condition_data.get('chronic', True),
                    is_active=True
                )
                db.session.add(condition)
                conditions_created += 1
        except Exception as e:
            print(f"⚠️  Error creating condition '{condition_data['name']}': {e}")
            continue
    
    # Commit all conditions
    try:
        db.session.commit()
        print(f"✅ Successfully created {conditions_created} conditions")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error committing conditions: {e}")
        return
    
    # Print statistics
    total_count = Condition.query.count()
    print(f"📋 Total conditions in catalog: {total_count}")
    
    # Print categories
    categories = {}
    for condition in Condition.query.all():
        cat = condition.category
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += 1
    
    print("\n📊 Conditions by category:")
    for category, count in sorted(categories.items()):
        print(f"   - {category.title()}: {count}")
    
    print("✅ Conditions catalog ready")


if __name__ == '__main__':
    with app.app_context():
        seed_conditions(auto_skip=False)
