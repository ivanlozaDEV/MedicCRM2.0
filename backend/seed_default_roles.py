"""
Seed default roles with permissions for a new organization.
This script creates the 5 predefined roles with best-practice permissions
when a new organization is created.
"""
from models import db
from models.role import Role
from models.permission import Permission
from models.role_permission import RolePermission


def seed_default_roles_for_organization(organization_id):
    """
    Create 5 default roles with predefined permissions for an organization.
    
    Args:
        organization_id (int): The organization ID to create roles for
        
    Returns:
        list: List of created roles
    """
    print(f"\n🎭 Creating default roles for organization {organization_id}...")
    
    # Define roles with their permission patterns
    roles_config = {
        'Administrador': {
            'description': 'Control total del sistema y configuración',
            'color': '#6366F1',  # Indigo
            'permissions': [
                # Sistema
                'users.view', 'users.create', 'users.update', 'users.delete',
                'roles.view', 'roles.create', 'roles.update', 'roles.delete',
                'permissions.view',
                'role_permissions.manage',
                'organizations.view', 'organizations.update',
                'subscriptions.view', 'subscriptions.manage',
                'dashboard.view',
                'settings.view', 'settings.update',
                'audit_logs.view', 'audit_logs.export',
                'notifications.view', 'notifications.create', 'notifications.update', 'notifications.delete',
                
                # Configuración administrativa
                'specialties.view', 'specialties.create', 'specialties.update', 'specialties.delete',
                'appointment_types.view', 'appointment_types.create', 'appointment_types.update', 'appointment_types.delete',
                'rooms.view', 'rooms.create', 'rooms.update', 'rooms.delete',
                'doctor_schedules.view', 'doctor_schedules.create', 'doctor_schedules.update', 'doctor_schedules.delete',
                
                # Solo datos básicos de pacientes (no datos clínicos)
                'patients.view',
                
                # Reportes
                'reports.view', 'reports.export',
            ]
        },
        'Doctor': {
            'description': 'Personal médico con acceso total a datos clínicos',
            'color': '#10B981',  # Green
            'permissions': [
                # Dashboard
                'dashboard.view',
                
                # Pacientes - todo excepto eliminar
                'patients.view', 'patients.create', 'patients.update',
                'patient_contacts.view', 'patient_contacts.create', 'patient_contacts.update',
                'allergies.view', 'allergies.create', 'allergies.update',
                'chronic_conditions.view', 'chronic_conditions.create', 'chronic_conditions.update',
                
                # Citas
                'appointments.view', 'appointments.create', 'appointments.update',
                'appointment_types.view',
                
                # Consultas - control total
                'consultations.view', 'consultations.create', 'consultations.update', 'consultations.delete',
                'vital_signs.view', 'vital_signs.create', 'vital_signs.update', 'vital_signs.delete',
                'consultation_templates.view', 'consultation_templates.create', 'consultation_templates.update',
                
                # Recetas - control total
                'prescriptions.view', 'prescriptions.create', 'prescriptions.update', 'prescriptions.delete',
                'prescription_items.view', 'prescription_items.create', 'prescription_items.update', 'prescription_items.delete',
                
                # Servicios
                'services.view',
                'consultation_services.view', 'consultation_services.create', 'consultation_services.update',
                
                # Documentos clínicos
                'documents.view', 'documents.upload', 'documents.download', 'documents.delete',
                'lab_results.view', 'lab_results.create', 'lab_results.update', 'lab_results.delete',
                
                # Pagos - solo ver
                'payments.view',
                
                # Ver especialidades
                'specialties.view',
            ]
        },
        'Enfermera': {
            'description': 'Personal de enfermería con acceso limitado a datos clínicos',
            'color': '#EC4899',  # Pink
            'permissions': [
                # Dashboard
                'dashboard.view',
                
                # Pacientes - ver y editar, no eliminar
                'patients.view', 'patients.update',
                'patient_contacts.view', 'patient_contacts.create',
                'allergies.view', 'allergies.create',
                'chronic_conditions.view', 'chronic_conditions.create',
                
                # Citas - ver y crear
                'appointments.view', 'appointments.create',
                'appointment_types.view',
                
                # Consultas - solo ver
                'consultations.view',
                
                # Signos vitales - control total
                'vital_signs.view', 'vital_signs.create', 'vital_signs.update', 'vital_signs.delete',
                
                # Recetas - solo ver
                'prescriptions.view',
                'prescription_items.view',
                
                # Documentos - ver y subir
                'documents.view', 'documents.upload',
                'lab_results.view',
            ]
        },
        'Recepcionista': {
            'description': 'Personal administrativo de recepción',
            'color': '#F59E0B',  # Amber
            'permissions': [
                # Dashboard
                'dashboard.view',
                
                # Pacientes - control total (solo datos administrativos)
                'patients.view', 'patients.create', 'patients.update', 'patients.delete',
                'patient_contacts.view', 'patient_contacts.create', 'patient_contacts.update', 'patient_contacts.delete',
                
                # Citas - control total
                'appointments.view', 'appointments.create', 'appointments.update', 'appointments.delete',
                'appointment_types.view',
                
                # Consultas - solo ver (sin detalles clínicos sensibles)
                'consultations.view',
                
                # Pagos - control total
                'payments.view', 'payments.create', 'payments.update', 'payments.delete',
                'payment_methods.view', 'payment_methods.create', 'payment_methods.update',
                
                # Salas y horarios - solo ver
                'rooms.view',
                'doctor_schedules.view',
                
                # Servicios
                'services.view',
            ]
        },
        'Contador': {
            'description': 'Personal financiero y contable',
            'color': '#14B8A6',  # Teal
            'permissions': [
                # Dashboard
                'dashboard.view',
                
                # Pacientes - solo datos básicos (para facturación)
                'patients.view',
                
                # Pagos - control total
                'payments.view', 'payments.create', 'payments.update', 'payments.delete',
                'payment_methods.view', 'payment_methods.create', 'payment_methods.update', 'payment_methods.delete',
                
                # Servicios - ver y editar precios
                'services.view', 'services.update',
                'consultation_services.view',
                
                # Reportes
                'reports.view', 'reports.export',
            ]
        }
    }
    
    created_roles = []
    
    # Get all permissions once
    all_permissions = {p.module_key: p for p in Permission.query.all()}
    
    for role_name, config in roles_config.items():
        print(f"  Creating role: {role_name}")
        
        # Create role
        role = Role(
            organization_id=organization_id,
            name=role_name,
            description=config['description'],
            color=config['color'],
            is_system=True  # Mark as system role
        )
        db.session.add(role)
        db.session.flush()  # Get role ID without committing
        
        # Assign permissions
        permissions_assigned = 0
        for perm_key in config['permissions']:
            if perm_key in all_permissions:
                role_perm = RolePermission(
                    role_id=role.id,
                    permission_id=all_permissions[perm_key].id
                )
                db.session.add(role_perm)
                permissions_assigned += 1
            else:
                print(f"    ⚠️  Permission not found: {perm_key}")
        
        print(f"    ✓ Assigned {permissions_assigned} permissions")
        created_roles.append(role)
    
    db.session.commit()
    print(f"✅ Created {len(created_roles)} default roles")
    
    return created_roles


if __name__ == '__main__':
    # For testing
    from app import app
    
    with app.app_context():
        org_id = int(input("Enter organization ID: "))
        seed_default_roles_for_organization(org_id)
