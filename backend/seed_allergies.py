"""
Seed script for Allergy catalog.
Populates the allergies table with common allergens organized by category.
"""

from app import app
from models import db
from models.allergy import Allergy

# Common allergies data with SNOMED CT codes
ALLERGIES_DATA = [
    # MEDICATIONS
    {
        'name': 'Penicilina',
        'description': 'Antibiótico betalactámico común',
        'snomed_code': '91936005',
        'rxnorm_code': '7980',
        'category': 'medication',
        'allergy_type': 'allergy',
        'common_reactions': ['urticaria', 'anafilaxia', 'erupción cutánea'],
        'typical_severity': 'moderate'
    },
    {
        'name': 'Aspirina',
        'description': 'Ácido acetilsalicílico (AAS)',
        'snomed_code': '293586001',
        'rxnorm_code': '1191',
        'category': 'medication',
        'allergy_type': 'allergy',
        'common_reactions': ['urticaria', 'asma', 'angioedema'],
        'typical_severity': 'moderate'
    },
    {
        'name': 'Ibuprofeno',
        'description': 'Antiinflamatorio no esteroideo (AINE)',
        'snomed_code': '293613001',
        'rxnorm_code': '5640',
        'category': 'medication',
        'allergy_type': 'allergy',
        'common_reactions': ['erupción cutánea', 'asma', 'malestar gastrointestinal'],
        'typical_severity': 'mild'
    },
    {
        'name': 'Amoxicilina',
        'description': 'Antibiótico betalactámico',
        'snomed_code': '294505008',
        'rxnorm_code': '723',
        'category': 'medication',
        'allergy_type': 'allergy',
        'common_reactions': ['erupción cutánea', 'urticaria', 'diarrea'],
        'typical_severity': 'mild'
    },
    {
        'name': 'Sulfamidas',
        'description': 'Antibióticos sulfonamidas',
        'snomed_code': '387406002',
        'category': 'medication',
        'allergy_type': 'allergy',
        'common_reactions': ['síndrome de Stevens-Johnson', 'erupción cutánea', 'fiebre'],
        'typical_severity': 'severe'
    },
    {
        'name': 'Anestésicos locales',
        'description': 'Lidocaína, procaína y similares',
        'snomed_code': '373477003',
        'category': 'medication',
        'allergy_type': 'allergy',
        'common_reactions': ['reacción en sitio de inyección', 'urticaria', 'anafilaxia'],
        'typical_severity': 'moderate'
    },
    
    # FOODS
    {
        'name': 'Maní (cacahuate)',
        'description': 'Arachis hypogaea',
        'snomed_code': '256349002',
        'category': 'food',
        'allergy_type': 'allergy',
        'common_reactions': ['anafilaxia', 'urticaria', 'dificultad respiratoria'],
        'typical_severity': 'severe'
    },
    {
        'name': 'Mariscos',
        'description': 'Crustáceos y moluscos',
        'snomed_code': '300913006',
        'category': 'food',
        'allergy_type': 'allergy',
        'common_reactions': ['anafilaxia', 'urticaria', 'angioedema'],
        'typical_severity': 'severe'
    },
    {
        'name': 'Leche de vaca',
        'description': 'Proteínas lácteas',
        'snomed_code': '425525006',
        'category': 'food',
        'allergy_type': 'allergy',
        'common_reactions': ['urticaria', 'vómito', 'diarrea', 'eccema'],
        'typical_severity': 'moderate'
    },
    {
        'name': 'Huevo',
        'description': 'Proteínas del huevo',
        'snomed_code': '91930004',
        'category': 'food',
        'allergy_type': 'allergy',
        'common_reactions': ['urticaria', 'erupción cutánea', 'náusea'],
        'typical_severity': 'mild'
    },
    {
        'name': 'Soya',
        'description': 'Glycine max',
        'snomed_code': '256353000',
        'category': 'food',
        'allergy_type': 'allergy',
        'common_reactions': ['urticaria', 'picazón', 'malestar gastrointestinal'],
        'typical_severity': 'mild'
    },
    {
        'name': 'Trigo',
        'description': 'Gluten y proteínas del trigo',
        'snomed_code': '420174000',
        'category': 'food',
        'allergy_type': 'allergy',
        'common_reactions': ['urticaria', 'anafilaxia', 'malestar gastrointestinal'],
        'typical_severity': 'moderate'
    },
    {
        'name': 'Nueces de árbol',
        'description': 'Almendras, nueces, avellanas',
        'snomed_code': '762952008',
        'category': 'food',
        'allergy_type': 'allergy',
        'common_reactions': ['anafilaxia', 'urticaria', 'dificultad respiratoria'],
        'typical_severity': 'severe'
    },
    {
        'name': 'Pescado',
        'description': 'Proteínas de pescado',
        'snomed_code': '417532002',
        'category': 'food',
        'allergy_type': 'allergy',
        'common_reactions': ['anafilaxia', 'urticaria', 'vómito'],
        'typical_severity': 'moderate'
    },
    
    # ENVIRONMENTAL
    {
        'name': 'Polen',
        'description': 'Polen de árboles, pastos y malezas',
        'snomed_code': '256277009',
        'category': 'environment',
        'allergy_type': 'allergy',
        'common_reactions': ['rinitis alérgica', 'conjuntivitis', 'estornudos'],
        'typical_severity': 'mild'
    },
    {
        'name': 'Ácaros del polvo',
        'description': 'Dermatophagoides pteronyssinus',
        'snomed_code': '390952000',
        'category': 'environment',
        'allergy_type': 'allergy',
        'common_reactions': ['rinitis', 'asma', 'eccema'],
        'typical_severity': 'moderate'
    },
    {
        'name': 'Caspa de animales',
        'description': 'Proteínas de piel y saliva de mascotas',
        'snomed_code': '232347008',
        'category': 'environment',
        'allergy_type': 'allergy',
        'common_reactions': ['rinitis', 'asma', 'picazón en ojos'],
        'typical_severity': 'mild'
    },
    {
        'name': 'Moho',
        'description': 'Esporas de hongos',
        'snomed_code': '419474003',
        'category': 'environment',
        'allergy_type': 'allergy',
        'common_reactions': ['rinitis', 'asma', 'tos'],
        'typical_severity': 'mild'
    },
    {
        'name': 'Cucarachas',
        'description': 'Proteínas de cucarachas',
        'snomed_code': '264287008',
        'category': 'environment',
        'allergy_type': 'allergy',
        'common_reactions': ['asma', 'rinitis', 'erupción cutánea'],
        'typical_severity': 'moderate'
    },
    
    # BIOLOGIC
    {
        'name': 'Látex',
        'description': 'Proteínas del látex natural',
        'snomed_code': '300916003',
        'category': 'biologic',
        'allergy_type': 'allergy',
        'common_reactions': ['urticaria', 'anafilaxia', 'dermatitis de contacto'],
        'typical_severity': 'moderate'
    },
    {
        'name': 'Picadura de abeja',
        'description': 'Veneno de himenópteros',
        'snomed_code': '424213003',
        'category': 'biologic',
        'allergy_type': 'allergy',
        'common_reactions': ['anafilaxia', 'hinchazón local', 'urticaria'],
        'typical_severity': 'severe'
    },
    {
        'name': 'Picadura de avispa',
        'description': 'Veneno de avispas',
        'snomed_code': '424213003',
        'category': 'biologic',
        'allergy_type': 'allergy',
        'common_reactions': ['anafilaxia', 'hinchazón local', 'dolor'],
        'typical_severity': 'severe'
    },
]


def seed_allergies(auto_skip=False):
    """
    Seed the allergies catalog with common allergens
    
    Args:
        auto_skip (bool): If True, automatically skip if allergies exist without asking
    """
    with app.app_context():
        print("Starting allergy catalog seeding...")
        
        # Check if allergies already exist
        existing_count = Allergy.query.count()
        if existing_count > 0:
            print(f"⚠️  Allergy catalog already contains {existing_count} entries.")
            if auto_skip:
                print("Seeding skipped (auto_skip=True).")
                return
            response = input("Do you want to skip seeding? (y/n): ")
            if response.lower() == 'y':
                print("Seeding skipped.")
                return
        
        # Create allergies
        created_count = 0
        skipped_count = 0
        
        for allergy_data in ALLERGIES_DATA:
            # Check if allergy already exists
            existing = Allergy.query.filter_by(name=allergy_data['name']).first()
            
            if existing:
                print(f"⚠️  Skipping '{allergy_data['name']}' (already exists)")
                skipped_count += 1
                continue
            
            try:
                allergy = Allergy.create(allergy_data)
                print(f"✅ Created: {allergy.name} ({allergy.category})")
                created_count += 1
            except Exception as e:
                print(f"❌ Error creating '{allergy_data['name']}': {str(e)}")
                db.session.rollback()
        
        print(f"\n{'='*60}")
        print(f"Allergy catalog seeding completed!")
        print(f"✅ Created: {created_count} allergies")
        print(f"⚠️  Skipped: {skipped_count} allergies")
        print(f"📊 Total in catalog: {Allergy.query.count()} allergies")
        print(f"{'='*60}\n")


if __name__ == '__main__':
    seed_allergies()
