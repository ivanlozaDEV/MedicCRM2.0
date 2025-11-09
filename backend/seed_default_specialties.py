"""
Seed default specialties (GLOBAL - not per organization).
Specialties are shared across all organizations.
"""
from models.specialty import Specialty
from models import db


def seed_default_specialties():
    """
    Creates default specialties in the database.
    These are GLOBAL and shared across all organizations.
    Should be run once when setting up the database.
    """
    
    default_specialties = [
        # Especialidades médicas generales
        {
            'name': 'Medicina General',
            'description': 'Atención médica integral y preventiva para toda la familia',
            'default_appointment_duration': 30,
            'default_color': '#3B82F6',
            'icon': 'user-doctor',
            'is_active': True
        },
        {
            'name': 'Pediatría',
            'description': 'Atención médica especializada para niños y adolescentes',
            'default_appointment_duration': 30,
            'default_color': '#10B981',
            'icon': 'baby',
            'is_active': True
        },
        {
            'name': 'Geriatría',
            'description': 'Atención médica especializada para adultos mayores',
            'default_appointment_duration': 45,
            'default_color': '#8B5CF6',
            'icon': 'user-nurse',
            'is_active': True
        },
        
        # Especialidades quirúrgicas
        {
            'name': 'Cirugía General',
            'description': 'Procedimientos quirúrgicos de diversas áreas del cuerpo',
            'default_appointment_duration': 45,
            'default_color': '#EF4444',
            'icon': 'scissors',
            'is_active': True
        },
        {
            'name': 'Cirugía Plástica',
            'description': 'Cirugía reconstructiva y estética',
            'default_appointment_duration': 45,
            'default_color': '#EC4899',
            'icon': 'hand-sparkles',
            'is_active': True
        },
        {
            'name': 'Neurocirugía',
            'description': 'Cirugía del sistema nervioso central y periférico',
            'default_appointment_duration': 60,
            'default_color': '#6366F1',
            'icon': 'brain',
            'is_active': True
        },
        
        # Especialidades médico-quirúrgicas
        {
            'name': 'Ginecología y Obstetricia',
            'description': 'Salud reproductiva y atención del embarazo',
            'default_appointment_duration': 30,
            'default_color': '#EC4899',
            'icon': 'person-pregnant',
            'is_active': True
        },
        {
            'name': 'Oftalmología',
            'description': 'Salud visual y tratamiento de enfermedades oculares',
            'default_appointment_duration': 30,
            'default_color': '#8B5CF6',
            'icon': 'eye',
            'is_active': True
        },
        {
            'name': 'Otorrinolaringología',
            'description': 'Oído, nariz y garganta',
            'default_appointment_duration': 30,
            'default_color': '#06B6D4',
            'icon': 'ear-listen',
            'is_active': True
        },
        {
            'name': 'Traumatología y Ortopedia',
            'description': 'Lesiones del sistema musculoesquelético',
            'default_appointment_duration': 45,
            'default_color': '#6B7280',
            'icon': 'bone',
            'is_active': True
        },
        {
            'name': 'Urología',
            'description': 'Sistema urinario y aparato reproductor masculino',
            'default_appointment_duration': 30,
            'default_color': '#14B8A6',
            'icon': 'droplet',
            'is_active': True
        },
        
        # Especialidades diagnósticas y terapéuticas
        {
            'name': 'Cardiología',
            'description': 'Diagnóstico y tratamiento de enfermedades cardiovasculares',
            'default_appointment_duration': 45,
            'default_color': '#EF4444',
            'icon': 'heart-pulse',
            'is_active': True
        },
        {
            'name': 'Dermatología',
            'description': 'Cuidado de la piel, cabello y uñas',
            'default_appointment_duration': 30,
            'default_color': '#F59E0B',
            'icon': 'hand',
            'is_active': True
        },
        {
            'name': 'Endocrinología',
            'description': 'Trastornos hormonales y metabólicos',
            'default_appointment_duration': 45,
            'default_color': '#F97316',
            'icon': 'flask',
            'is_active': True
        },
        {
            'name': 'Gastroenterología',
            'description': 'Sistema digestivo y enfermedades hepáticas',
            'default_appointment_duration': 45,
            'default_color': '#84CC16',
            'icon': 'stomach',
            'is_active': True
        },
        {
            'name': 'Hematología',
            'description': 'Enfermedades de la sangre y tejidos hematopoyéticos',
            'default_appointment_duration': 45,
            'default_color': '#DC2626',
            'icon': 'droplet',
            'is_active': True
        },
        {
            'name': 'Nefrología',
            'description': 'Enfermedades renales y del sistema urinario',
            'default_appointment_duration': 45,
            'default_color': '#0EA5E9',
            'icon': 'kidney',
            'is_active': True
        },
        {
            'name': 'Neumología',
            'description': 'Enfermedades del sistema respiratorio',
            'default_appointment_duration': 45,
            'default_color': '#06B6D4',
            'icon': 'lungs',
            'is_active': True
        },
        {
            'name': 'Neurología',
            'description': 'Enfermedades del sistema nervioso',
            'default_appointment_duration': 45,
            'default_color': '#6366F1',
            'icon': 'brain',
            'is_active': True
        },
        {
            'name': 'Oncología',
            'description': 'Prevención, diagnóstico y tratamiento del cáncer',
            'default_appointment_duration': 60,
            'default_color': '#7C3AED',
            'icon': 'ribbon',
            'is_active': True
        },
        {
            'name': 'Reumatología',
            'description': 'Enfermedades reumáticas y autoinmunes',
            'default_appointment_duration': 45,
            'default_color': '#F59E0B',
            'icon': 'bone',
            'is_active': True
        },
        
        # Salud mental
        {
            'name': 'Psiquiatría',
            'description': 'Diagnóstico y tratamiento de trastornos mentales',
            'default_appointment_duration': 60,
            'default_color': '#6366F1',
            'icon': 'brain',
            'is_active': True
        },
        {
            'name': 'Psicología',
            'description': 'Salud mental y bienestar emocional',
            'default_appointment_duration': 60,
            'default_color': '#8B5CF6',
            'icon': 'head-side-medical',
            'is_active': True
        },
        
        # Medicina de rehabilitación
        {
            'name': 'Medicina Física y Rehabilitación',
            'description': 'Recuperación funcional y rehabilitación',
            'default_appointment_duration': 60,
            'default_color': '#14B8A6',
            'icon': 'person-walking',
            'is_active': True
        },
        {
            'name': 'Fisioterapia',
            'description': 'Terapia física y rehabilitación muscular',
            'default_appointment_duration': 60,
            'default_color': '#14B8A6',
            'icon': 'dumbbell',
            'is_active': True
        },
        
        # Odontología
        {
            'name': 'Odontología General',
            'description': 'Salud bucal y tratamiento dental general',
            'default_appointment_duration': 45,
            'default_color': '#06B6D4',
            'icon': 'tooth',
            'is_active': True
        },
        {
            'name': 'Ortodoncia',
            'description': 'Corrección de malposiciones dentarias',
            'default_appointment_duration': 45,
            'default_color': '#0EA5E9',
            'icon': 'teeth',
            'is_active': True
        },
        {
            'name': 'Endodoncia',
            'description': 'Tratamiento de conductos radiculares',
            'default_appointment_duration': 60,
            'default_color': '#06B6D4',
            'icon': 'tooth',
            'is_active': True
        },
        {
            'name': 'Periodoncia',
            'description': 'Enfermedades de las encías y tejidos de soporte',
            'default_appointment_duration': 45,
            'default_color': '#14B8A6',
            'icon': 'tooth',
            'is_active': True
        },
        {
            'name': 'Cirugía Maxilofacial',
            'description': 'Cirugía de boca, mandíbula y rostro',
            'default_appointment_duration': 60,
            'default_color': '#EF4444',
            'icon': 'face-smile',
            'is_active': True
        },
        
        # Nutrición y dietética
        {
            'name': 'Nutrición y Dietética',
            'description': 'Asesoría nutricional y planes alimenticios',
            'default_appointment_duration': 45,
            'default_color': '#84CC16',
            'icon': 'apple-whole',
            'is_active': True
        },
        
        # Medicina del deporte
        {
            'name': 'Medicina del Deporte',
            'description': 'Prevención y tratamiento de lesiones deportivas',
            'default_appointment_duration': 45,
            'default_color': '#10B981',
            'icon': 'person-running',
            'is_active': True
        },
        
        # Medicina de emergencia
        {
            'name': 'Medicina de Urgencias',
            'description': 'Atención de emergencias médicas',
            'default_appointment_duration': 30,
            'default_color': '#DC2626',
            'icon': 'truck-medical',
            'is_active': True
        },
        
        # Alergología
        {
            'name': 'Alergología e Inmunología',
            'description': 'Diagnóstico y tratamiento de alergias',
            'default_appointment_duration': 30,
            'default_color': '#F59E0B',
            'icon': 'virus',
            'is_active': True
        },
        
        # Medicina interna
        {
            'name': 'Medicina Interna',
            'description': 'Diagnóstico y tratamiento de enfermedades del adulto',
            'default_appointment_duration': 45,
            'default_color': '#3B82F6',
            'icon': 'stethoscope',
            'is_active': True
        },
        
        # Infectología
        {
            'name': 'Infectología',
            'description': 'Enfermedades infecciosas y tropicales',
            'default_appointment_duration': 45,
            'default_color': '#EF4444',
            'icon': 'bacteria',
            'is_active': True
        },
        
        # Anestesiología
        {
            'name': 'Anestesiología',
            'description': 'Manejo del dolor y anestesia',
            'default_appointment_duration': 30,
            'default_color': '#6B7280',
            'icon': 'syringe',
            'is_active': True
        },
        
        # Medicina del trabajo
        {
            'name': 'Medicina del Trabajo',
            'description': 'Salud ocupacional y prevención de riesgos laborales',
            'default_appointment_duration': 30,
            'default_color': '#F97316',
            'icon': 'briefcase-medical',
            'is_active': True
        },
        
        # Genética médica
        {
            'name': 'Genética Médica',
            'description': 'Diagnóstico y asesoramiento genético',
            'default_appointment_duration': 60,
            'default_color': '#8B5CF6',
            'icon': 'dna',
            'is_active': True
        },
    ]
    
    created_specialties = []
    
    for specialty_data in default_specialties:
        # Check if specialty already exists (global)
        existing = Specialty.query.filter_by(
            name=specialty_data['name']
        ).first()
        
        if not existing:
            specialty = Specialty(
                name=specialty_data['name'],
                description=specialty_data['description'],
                default_appointment_duration=specialty_data['default_appointment_duration'],
                default_color=specialty_data['default_color'],
                icon=specialty_data['icon'],
                is_active=specialty_data['is_active']
            )
            db.session.add(specialty)
            created_specialties.append(specialty_data['name'])
    
    try:
        db.session.commit()
        print(f"✓ Created {len(created_specialties)} default specialties globally")
        if created_specialties:
            print(f"  Added: {', '.join(created_specialties)}")
        return True
    except Exception as e:
        db.session.rollback()
        print(f"✗ Error creating default specialties: {str(e)}")
        return False
