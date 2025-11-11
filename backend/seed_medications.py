"""
Seed common medications into the database.
This script populates the medications table with commonly prescribed medications.
"""

from models import db, Medication
from app import app


def seed_medications(auto_skip=True):
    """
    Seed common medications.
    
    Args:
        auto_skip (bool): If True, skip seeding if medications already exist.
                         If False, always run the seed (for testing/development).
    """
    print("\n🔄 Seeding Medications...")
    
    # Check if medications already exist
    existing_count = Medication.query.count()
    if auto_skip and existing_count > 0:
        print(f"⏭️  Medications already seeded ({existing_count} medications found). Skipping...")
        return
    
    medications_data = [
        # ANTIBIOTICS
        {
            'name': 'Amoxicillin',
            'generic_name': 'Amoxicillin',
            'brand_names': ['Amoxil', 'Trimox', 'Moxatag'],
            'description': 'Penicillin antibiotic used to treat bacterial infections',
            'rxnorm_code': '723',
            'category': 'antibiotic',
            'drug_class': 'Penicillin',
            'typical_doses': ['250 mg', '500 mg', '875 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['every 8 hours', 'every 12 hours', 'three times daily'],
            'common_indications': ['Bacterial infections', 'Respiratory infections', 'Ear infections', 'Urinary tract infections'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        {
            'name': 'Azithromycin',
            'generic_name': 'Azithromycin',
            'brand_names': ['Zithromax', 'Z-Pak'],
            'description': 'Macrolide antibiotic for treating bacterial infections',
            'rxnorm_code': '18631',
            'category': 'antibiotic',
            'drug_class': 'Macrolide',
            'typical_doses': ['250 mg', '500 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily', 'day 1: 500mg, days 2-5: 250mg'],
            'common_indications': ['Respiratory infections', 'Skin infections', 'Sexually transmitted infections'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        {
            'name': 'Ciprofloxacin',
            'generic_name': 'Ciprofloxacin',
            'brand_names': ['Cipro'],
            'description': 'Fluoroquinolone antibiotic for various bacterial infections',
            'rxnorm_code': '2551',
            'category': 'antibiotic',
            'drug_class': 'Fluoroquinolone',
            'typical_doses': ['250 mg', '500 mg', '750 mg'],
            'typical_routes': ['oral', 'IV'],
            'typical_frequencies': ['every 12 hours', 'twice daily'],
            'common_indications': ['Urinary tract infections', 'Respiratory infections', 'Skin infections'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        
        # ANALGESICS / PAIN RELIEF
        {
            'name': 'Acetaminophen',
            'generic_name': 'Acetaminophen',
            'brand_names': ['Tylenol', 'Paracetamol'],
            'description': 'Pain reliever and fever reducer',
            'rxnorm_code': '161',
            'category': 'analgesic',
            'drug_class': 'Analgesic/Antipyretic',
            'typical_doses': ['325 mg', '500 mg', '650 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['every 4-6 hours', 'as needed'],
            'common_indications': ['Pain', 'Fever', 'Headache'],
            'requires_prescription': False,
            'controlled_substance': None
        },
        {
            'name': 'Ibuprofen',
            'generic_name': 'Ibuprofen',
            'brand_names': ['Advil', 'Motrin'],
            'description': 'Nonsteroidal anti-inflammatory drug (NSAID)',
            'rxnorm_code': '5640',
            'category': 'analgesic',
            'drug_class': 'NSAID',
            'typical_doses': ['200 mg', '400 mg', '600 mg', '800 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['every 6-8 hours', 'as needed'],
            'common_indications': ['Pain', 'Fever', 'Inflammation', 'Arthritis'],
            'requires_prescription': False,
            'controlled_substance': None
        },
        {
            'name': 'Tramadol',
            'generic_name': 'Tramadol',
            'brand_names': ['Ultram', 'ConZip'],
            'description': 'Opioid pain medication for moderate to severe pain',
            'rxnorm_code': '10689',
            'category': 'analgesic',
            'drug_class': 'Opioid Analgesic',
            'typical_doses': ['50 mg', '100 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['every 4-6 hours', 'as needed'],
            'common_indications': ['Moderate to severe pain'],
            'requires_prescription': True,
            'controlled_substance': 'IV'
        },
        
        # ANTIHYPERTENSIVES
        {
            'name': 'Lisinopril',
            'generic_name': 'Lisinopril',
            'brand_names': ['Prinivil', 'Zestril'],
            'description': 'ACE inhibitor for high blood pressure',
            'rxnorm_code': '29046',
            'category': 'antihypertensive',
            'drug_class': 'ACE Inhibitor',
            'typical_doses': ['5 mg', '10 mg', '20 mg', '40 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily'],
            'common_indications': ['Hypertension', 'Heart failure', 'Post-myocardial infarction'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        {
            'name': 'Amlodipine',
            'generic_name': 'Amlodipine',
            'brand_names': ['Norvasc'],
            'description': 'Calcium channel blocker for high blood pressure',
            'rxnorm_code': '17767',
            'category': 'antihypertensive',
            'drug_class': 'Calcium Channel Blocker',
            'typical_doses': ['2.5 mg', '5 mg', '10 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily'],
            'common_indications': ['Hypertension', 'Angina'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        {
            'name': 'Metoprolol',
            'generic_name': 'Metoprolol',
            'brand_names': ['Lopressor', 'Toprol-XL'],
            'description': 'Beta blocker for high blood pressure and heart conditions',
            'rxnorm_code': '6918',
            'category': 'antihypertensive',
            'drug_class': 'Beta Blocker',
            'typical_doses': ['25 mg', '50 mg', '100 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily', 'twice daily'],
            'common_indications': ['Hypertension', 'Angina', 'Heart failure', 'Arrhythmia'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        
        # DIABETES MEDICATIONS
        {
            'name': 'Metformin',
            'generic_name': 'Metformin',
            'brand_names': ['Glucophage', 'Fortamet'],
            'description': 'Oral diabetes medication that helps control blood sugar',
            'rxnorm_code': '6809',
            'category': 'antidiabetic',
            'drug_class': 'Biguanide',
            'typical_doses': ['500 mg', '850 mg', '1000 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily', 'twice daily', 'with meals'],
            'common_indications': ['Type 2 diabetes', 'Prediabetes', 'Polycystic ovary syndrome'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        {
            'name': 'Insulin Glargine',
            'generic_name': 'Insulin Glargine',
            'brand_names': ['Lantus', 'Basaglar', 'Toujeo'],
            'description': 'Long-acting insulin for diabetes',
            'rxnorm_code': '274783',
            'category': 'antidiabetic',
            'drug_class': 'Insulin',
            'typical_doses': ['Variable based on blood sugar'],
            'typical_routes': ['subcutaneous injection'],
            'typical_frequencies': ['once daily'],
            'common_indications': ['Type 1 diabetes', 'Type 2 diabetes'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        
        # CHOLESTEROL MEDICATIONS
        {
            'name': 'Atorvastatin',
            'generic_name': 'Atorvastatin',
            'brand_names': ['Lipitor'],
            'description': 'Statin medication to lower cholesterol',
            'rxnorm_code': '83367',
            'category': 'antilipidemic',
            'drug_class': 'Statin',
            'typical_doses': ['10 mg', '20 mg', '40 mg', '80 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily'],
            'common_indications': ['High cholesterol', 'Cardiovascular disease prevention'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        {
            'name': 'Simvastatin',
            'generic_name': 'Simvastatin',
            'brand_names': ['Zocor'],
            'description': 'Statin used to lower cholesterol levels',
            'rxnorm_code': '36567',
            'category': 'antilipidemic',
            'drug_class': 'Statin',
            'typical_doses': ['10 mg', '20 mg', '40 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily in evening'],
            'common_indications': ['High cholesterol', 'Heart disease prevention'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        
        # ANTIDEPRESSANTS
        {
            'name': 'Sertraline',
            'generic_name': 'Sertraline',
            'brand_names': ['Zoloft'],
            'description': 'SSRI antidepressant',
            'rxnorm_code': '36437',
            'category': 'antidepressant',
            'drug_class': 'SSRI',
            'typical_doses': ['25 mg', '50 mg', '100 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily'],
            'common_indications': ['Depression', 'Anxiety', 'OCD', 'PTSD', 'Panic disorder'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        {
            'name': 'Escitalopram',
            'generic_name': 'Escitalopram',
            'brand_names': ['Lexapro'],
            'description': 'SSRI for depression and anxiety',
            'rxnorm_code': '321988',
            'category': 'antidepressant',
            'drug_class': 'SSRI',
            'typical_doses': ['5 mg', '10 mg', '20 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily'],
            'common_indications': ['Depression', 'Generalized anxiety disorder'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        
        # GASTRIC MEDICATIONS
        {
            'name': 'Omeprazole',
            'generic_name': 'Omeprazole',
            'brand_names': ['Prilosec'],
            'description': 'Proton pump inhibitor for acid reflux',
            'rxnorm_code': '7646',
            'category': 'gastrointestinal',
            'drug_class': 'Proton Pump Inhibitor',
            'typical_doses': ['20 mg', '40 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily before meals'],
            'common_indications': ['GERD', 'Heartburn', 'Stomach ulcers'],
            'requires_prescription': False,
            'controlled_substance': None
        },
        
        # ANTICOAGULANTS
        {
            'name': 'Warfarin',
            'generic_name': 'Warfarin',
            'brand_names': ['Coumadin', 'Jantoven'],
            'description': 'Anticoagulant (blood thinner)',
            'rxnorm_code': '11289',
            'category': 'anticoagulant',
            'drug_class': 'Vitamin K Antagonist',
            'typical_doses': ['1 mg', '2 mg', '2.5 mg', '5 mg', '10 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily'],
            'common_indications': ['Atrial fibrillation', 'Blood clots', 'Stroke prevention'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        {
            'name': 'Apixaban',
            'generic_name': 'Apixaban',
            'brand_names': ['Eliquis'],
            'description': 'Anticoagulant to prevent blood clots',
            'rxnorm_code': '1364430',
            'category': 'anticoagulant',
            'drug_class': 'Direct Factor Xa Inhibitor',
            'typical_doses': ['2.5 mg', '5 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['twice daily'],
            'common_indications': ['Atrial fibrillation', 'Deep vein thrombosis', 'Pulmonary embolism'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        
        # ASTHMA/COPD
        {
            'name': 'Albuterol',
            'generic_name': 'Albuterol',
            'brand_names': ['ProAir', 'Ventolin', 'Proventil'],
            'description': 'Bronchodilator for asthma and breathing problems',
            'rxnorm_code': '435',
            'category': 'bronchodilator',
            'drug_class': 'Beta-2 Agonist',
            'typical_doses': ['90 mcg per puff'],
            'typical_routes': ['inhalation'],
            'typical_frequencies': ['every 4-6 hours as needed', '2 puffs'],
            'common_indications': ['Asthma', 'COPD', 'Bronchospasm'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        
        # THYROID
        {
            'name': 'Levothyroxine',
            'generic_name': 'Levothyroxine',
            'brand_names': ['Synthroid', 'Levoxyl'],
            'description': 'Thyroid hormone replacement',
            'rxnorm_code': '10582',
            'category': 'thyroid',
            'drug_class': 'Thyroid Hormone',
            'typical_doses': ['25 mcg', '50 mcg', '75 mcg', '100 mcg', '125 mcg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily on empty stomach'],
            'common_indications': ['Hypothyroidism', 'Thyroid hormone deficiency'],
            'requires_prescription': True,
            'controlled_substance': None
        },
        
        # ANTIHISTAMINES
        {
            'name': 'Cetirizine',
            'generic_name': 'Cetirizine',
            'brand_names': ['Zyrtec'],
            'description': 'Antihistamine for allergies',
            'rxnorm_code': '20610',
            'category': 'antihistamine',
            'drug_class': 'Antihistamine',
            'typical_doses': ['5 mg', '10 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily'],
            'common_indications': ['Allergic rhinitis', 'Hives', 'Itching'],
            'requires_prescription': False,
            'controlled_substance': None
        },
        {
            'name': 'Loratadine',
            'generic_name': 'Loratadine',
            'brand_names': ['Claritin'],
            'description': 'Non-drowsy antihistamine for allergies',
            'rxnorm_code': '6249',
            'category': 'antihistamine',
            'drug_class': 'Antihistamine',
            'typical_doses': ['10 mg'],
            'typical_routes': ['oral'],
            'typical_frequencies': ['once daily'],
            'common_indications': ['Seasonal allergies', 'Allergic rhinitis', 'Hives'],
            'requires_prescription': False,
            'controlled_substance': None
        }
    ]
    
    created_count = 0
    skipped_count = 0
    
    for med_data in medications_data:
        # Check if medication already exists
        existing = Medication.query.filter_by(name=med_data['name']).first()
        
        if existing:
            print(f"  ⏭️  Skipping '{med_data['name']}' - already exists")
            skipped_count += 1
            continue
        
        try:
            medication = Medication.create(med_data)
            print(f"  ✅ Created: {medication.name} ({medication.category})")
            created_count += 1
        except Exception as e:
            print(f"  ❌ Error creating {med_data['name']}: {str(e)}")
            db.session.rollback()
    
    print(f"\n✨ Medications seeding complete!")
    print(f"   Created: {created_count}")
    print(f"   Skipped: {skipped_count}")
    print(f"   Total: {Medication.query.count()} medications in database\n")


if __name__ == '__main__':
    with app.app_context():
        seed_medications(auto_skip=False)  # Set to False for standalone execution
