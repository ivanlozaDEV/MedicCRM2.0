#!/usr/bin/env python3
"""
Database Reset Script
Drops all tables and recreates them from SQLAlchemy models
WARNING: This will DELETE ALL DATA in the database!
"""

import sys
import os

# Add the parent directory to the path to import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models.organization import Organization
from models.user import User
from models.subscription import Subscription
from models.role import Role
from models.permission import Permission
from models.role_permission import RolePermission
from models.specialty import Specialty
from models.user_specialty import UserSpecialty
from models.user_role import UserRole


def seed_permissions():
    """Create all system permissions based on the 28-table structure."""
    
    # Define all permissions with their categories
    # Format: (module_key, display_name, description, category)
    permissions_data = [
        # ============ SYSTEM (6 tables) ============
        # 1. Organizations
        ('organizations.view', 'Ver Organizaciones', 'Ver listado y detalles de clínicas/consultorios', 'system'),
        ('organizations.create', 'Crear Organizaciones', 'Crear nuevas clínicas/consultorios', 'system'),
        ('organizations.update', 'Editar Organizaciones', 'Modificar información de clínicas/consultorios', 'system'),
        ('organizations.delete', 'Eliminar Organizaciones', 'Eliminar clínicas/consultorios', 'system'),
        
        # 2. Users
        ('users.view', 'Ver Usuarios', 'Ver listado y detalles de usuarios del sistema', 'system'),
        ('users.create', 'Crear Usuarios', 'Crear nuevos usuarios del sistema', 'system'),
        ('users.update', 'Editar Usuarios', 'Modificar información de usuarios', 'system'),
        ('users.delete', 'Eliminar Usuarios', 'Eliminar usuarios del sistema', 'system'),
        
        # 3. Subscriptions
        ('subscriptions.view', 'Ver Suscripciones', 'Ver suscripciones de LemonSqueezy', 'system'),
        ('subscriptions.manage', 'Gestionar Suscripciones', 'Administrar suscripciones y pagos', 'system'),
        
        # 4. Roles
        ('roles.view', 'Ver Roles', 'Ver listado y detalles de roles', 'system'),
        ('roles.create', 'Crear Roles', 'Crear nuevos roles personalizados', 'system'),
        ('roles.update', 'Editar Roles', 'Modificar roles existentes', 'system'),
        ('roles.delete', 'Eliminar Roles', 'Eliminar roles personalizados', 'system'),
        
        # 5. Permissions
        ('permissions.view', 'Ver Permisos', 'Ver listado de permisos del sistema', 'system'),
        ('permissions.create', 'Crear Permisos', 'Crear nuevos permisos', 'system'),
        ('permissions.update', 'Editar Permisos', 'Modificar permisos existentes', 'system'),
        ('permissions.delete', 'Eliminar Permisos', 'Eliminar permisos del sistema', 'system'),
        
        # 6. Role Permissions
        ('role_permissions.manage', 'Gestionar Permisos de Roles', 'Asignar/remover permisos a roles', 'system'),
        
        # ============ CLINICAL - PACIENTES (4 tables) ============
        # 7. Patients
        ('patients.view', 'Ver Pacientes', 'Ver listado y expedientes de pacientes', 'clinical'),
        ('patients.create', 'Crear Pacientes', 'Registrar nuevos pacientes', 'clinical'),
        ('patients.update', 'Editar Pacientes', 'Modificar información de pacientes', 'clinical'),
        ('patients.delete', 'Eliminar Pacientes', 'Eliminar registros de pacientes', 'clinical'),
        
        # 8. Patient Contacts
        ('patient_contacts.view', 'Ver Contactos de Emergencia', 'Ver contactos de emergencia de pacientes', 'clinical'),
        ('patient_contacts.create', 'Crear Contactos de Emergencia', 'Agregar contactos de emergencia', 'clinical'),
        ('patient_contacts.update', 'Editar Contactos de Emergencia', 'Modificar contactos de emergencia', 'clinical'),
        ('patient_contacts.delete', 'Eliminar Contactos de Emergencia', 'Eliminar contactos de emergencia', 'clinical'),
        
        # 9. Allergies
        ('allergies.view', 'Ver Alergias', 'Ver alergias de pacientes', 'clinical'),
        ('allergies.create', 'Registrar Alergias', 'Registrar nuevas alergias de pacientes', 'clinical'),
        ('allergies.update', 'Editar Alergias', 'Modificar registros de alergias', 'clinical'),
        ('allergies.delete', 'Eliminar Alergias', 'Eliminar registros de alergias', 'clinical'),
        
        # 10. Chronic Conditions
        ('chronic_conditions.view', 'Ver Condiciones Crónicas', 'Ver condiciones crónicas de pacientes', 'clinical'),
        ('chronic_conditions.create', 'Registrar Condiciones Crónicas', 'Registrar nuevas condiciones crónicas', 'clinical'),
        ('chronic_conditions.update', 'Editar Condiciones Crónicas', 'Modificar condiciones crónicas', 'clinical'),
        ('chronic_conditions.delete', 'Eliminar Condiciones Crónicas', 'Eliminar registros de condiciones crónicas', 'clinical'),
        
        # ============ CLINICAL - CITAS Y CONSULTAS (9 tables) ============
        # 11. Specialties
        ('specialties.view', 'Ver Especialidades', 'Ver especialidades médicas disponibles', 'clinical'),
        ('specialties.create', 'Crear Especialidades', 'Crear nuevas especialidades médicas', 'clinical'),
        ('specialties.update', 'Editar Especialidades', 'Modificar especialidades médicas', 'clinical'),
        ('specialties.delete', 'Eliminar Especialidades', 'Eliminar especialidades médicas', 'clinical'),
        
        # 12. Appointment Types
        ('appointment_types.view', 'Ver Tipos de Cita', 'Ver tipos de cita disponibles', 'clinical'),
        ('appointment_types.create', 'Crear Tipos de Cita', 'Crear nuevos tipos de cita', 'clinical'),
        ('appointment_types.update', 'Editar Tipos de Cita', 'Modificar tipos de cita', 'clinical'),
        ('appointment_types.delete', 'Eliminar Tipos de Cita', 'Eliminar tipos de cita', 'clinical'),
        
        # 13. Rooms
        ('rooms.view', 'Ver Salas/Consultorios', 'Ver listado de salas y consultorios', 'administrative'),
        ('rooms.create', 'Crear Salas/Consultorios', 'Crear nuevas salas/consultorios', 'administrative'),
        ('rooms.update', 'Editar Salas/Consultorios', 'Modificar salas/consultorios', 'administrative'),
        ('rooms.delete', 'Eliminar Salas/Consultorios', 'Eliminar salas/consultorios', 'administrative'),
        
        # 14. Doctor Schedules
        ('doctor_schedules.view', 'Ver Horarios de Atención', 'Ver horarios de doctores', 'administrative'),
        ('doctor_schedules.create', 'Crear Horarios de Atención', 'Crear horarios para doctores', 'administrative'),
        ('doctor_schedules.update', 'Editar Horarios de Atención', 'Modificar horarios de doctores', 'administrative'),
        ('doctor_schedules.delete', 'Eliminar Horarios de Atención', 'Eliminar horarios de doctores', 'administrative'),
        
        # 15. Appointments
        ('appointments.view', 'Ver Citas', 'Ver citas agendadas', 'clinical'),
        ('appointments.create', 'Crear Citas', 'Agendar nuevas citas', 'clinical'),
        ('appointments.update', 'Editar Citas', 'Modificar o reagendar citas', 'clinical'),
        ('appointments.delete', 'Eliminar Citas', 'Cancelar/eliminar citas', 'clinical'),
        
        # 16. Consultations
        ('consultations.view', 'Ver Consultas', 'Ver consultas completadas', 'clinical'),
        ('consultations.create', 'Crear Consultas', 'Registrar nuevas consultas', 'clinical'),
        ('consultations.update', 'Editar Consultas', 'Modificar consultas existentes', 'clinical'),
        ('consultations.delete', 'Eliminar Consultas', 'Eliminar registros de consultas', 'clinical'),
        
        # 17. Vital Signs
        ('vital_signs.view', 'Ver Signos Vitales', 'Ver signos vitales de consultas', 'clinical'),
        ('vital_signs.create', 'Registrar Signos Vitales', 'Registrar signos vitales en consultas', 'clinical'),
        ('vital_signs.update', 'Editar Signos Vitales', 'Modificar signos vitales', 'clinical'),
        ('vital_signs.delete', 'Eliminar Signos Vitales', 'Eliminar registros de signos vitales', 'clinical'),
        
        # 18. Prescriptions
        ('prescriptions.view', 'Ver Recetas', 'Ver recetas médicas', 'clinical'),
        ('prescriptions.create', 'Crear Recetas', 'Crear nuevas recetas médicas', 'clinical'),
        ('prescriptions.update', 'Editar Recetas', 'Modificar recetas médicas', 'clinical'),
        ('prescriptions.delete', 'Eliminar Recetas', 'Eliminar recetas médicas', 'clinical'),
        
        # 19. Prescription Items
        ('prescription_items.view', 'Ver Medicamentos en Receta', 'Ver medicamentos en recetas', 'clinical'),
        ('prescription_items.create', 'Agregar Medicamentos a Receta', 'Agregar medicamentos a recetas', 'clinical'),
        ('prescription_items.update', 'Editar Medicamentos en Receta', 'Modificar medicamentos en recetas', 'clinical'),
        ('prescription_items.delete', 'Eliminar Medicamentos de Receta', 'Eliminar medicamentos de recetas', 'clinical'),
        
        # ============ ADMINISTRATIVE - SERVICIOS (3 tables) ============
        # 20. Services
        ('services.view', 'Ver Catálogo de Servicios', 'Ver servicios médicos disponibles', 'administrative'),
        ('services.create', 'Crear Servicios', 'Crear nuevos servicios médicos', 'administrative'),
        ('services.update', 'Editar Servicios', 'Modificar servicios médicos', 'administrative'),
        ('services.delete', 'Eliminar Servicios', 'Eliminar servicios médicos', 'administrative'),
        
        # 21. Consultation Services
        ('consultation_services.view', 'Ver Servicios en Consulta', 'Ver servicios aplicados en consultas', 'administrative'),
        ('consultation_services.create', 'Aplicar Servicios en Consulta', 'Aplicar servicios a consultas', 'administrative'),
        ('consultation_services.update', 'Editar Servicios en Consulta', 'Modificar servicios en consultas', 'administrative'),
        ('consultation_services.delete', 'Eliminar Servicios de Consulta', 'Eliminar servicios de consultas', 'administrative'),
        
        # 22. Consultation Templates
        ('consultation_templates.view', 'Ver Plantillas SOAP', 'Ver plantillas de consulta SOAP', 'clinical'),
        ('consultation_templates.create', 'Crear Plantillas SOAP', 'Crear plantillas de consulta', 'clinical'),
        ('consultation_templates.update', 'Editar Plantillas SOAP', 'Modificar plantillas de consulta', 'clinical'),
        ('consultation_templates.delete', 'Eliminar Plantillas SOAP', 'Eliminar plantillas de consulta', 'clinical'),
        
        # ============ ADMINISTRATIVE - DOCUMENTOS (2 tables) ============
        # 23. Documents
        ('documents.view', 'Ver Documentos', 'Ver documentos de pacientes', 'clinical'),
        ('documents.upload', 'Subir Documentos', 'Subir nuevos documentos', 'clinical'),
        ('documents.download', 'Descargar Documentos', 'Descargar documentos de pacientes', 'clinical'),
        ('documents.delete', 'Eliminar Documentos', 'Eliminar documentos', 'clinical'),
        
        # 24. Lab Results
        ('lab_results.view', 'Ver Resultados de Laboratorio', 'Ver resultados de laboratorio', 'clinical'),
        ('lab_results.create', 'Registrar Resultados de Laboratorio', 'Registrar nuevos resultados', 'clinical'),
        ('lab_results.update', 'Editar Resultados de Laboratorio', 'Modificar resultados de laboratorio', 'clinical'),
        ('lab_results.delete', 'Eliminar Resultados de Laboratorio', 'Eliminar resultados de laboratorio', 'clinical'),
        
        # ============ ADMINISTRATIVE - PAGOS (2 tables) ============
        # 25. Payments
        ('payments.view', 'Ver Pagos', 'Ver registro de pagos', 'administrative'),
        ('payments.create', 'Registrar Pagos', 'Registrar nuevos pagos', 'administrative'),
        ('payments.update', 'Editar Pagos', 'Modificar registros de pagos', 'administrative'),
        ('payments.delete', 'Eliminar Pagos', 'Eliminar registros de pagos', 'administrative'),
        
        # 26. Payment Methods
        ('payment_methods.view', 'Ver Métodos de Pago', 'Ver métodos de pago disponibles', 'administrative'),
        ('payment_methods.create', 'Crear Métodos de Pago', 'Crear nuevos métodos de pago', 'administrative'),
        ('payment_methods.update', 'Editar Métodos de Pago', 'Modificar métodos de pago', 'administrative'),
        ('payment_methods.delete', 'Eliminar Métodos de Pago', 'Eliminar métodos de pago', 'administrative'),
        
        # ============ SYSTEM - SISTEMA (2 tables) ============
        # 27. Audit Logs
        ('audit_logs.view', 'Ver Auditoría', 'Ver registros de auditoría del sistema', 'system'),
        ('audit_logs.export', 'Exportar Auditoría', 'Exportar logs de auditoría', 'system'),
        
        # 28. Notifications
        ('notifications.view', 'Ver Notificaciones', 'Ver notificaciones del sistema', 'system'),
        ('notifications.create', 'Crear Notificaciones', 'Crear notificaciones manuales', 'system'),
        ('notifications.update', 'Marcar Notificaciones', 'Marcar como leídas/no leídas', 'system'),
        ('notifications.delete', 'Eliminar Notificaciones', 'Eliminar notificaciones', 'system'),
        
        # ============ ADDITIONAL SYSTEM PERMISSIONS ============
        ('dashboard.view', 'Ver Dashboard', 'Acceder al panel de control', 'system'),
        ('reports.view', 'Ver Reportes', 'Ver reportes y estadísticas', 'administrative'),
        ('reports.export', 'Exportar Reportes', 'Exportar reportes en PDF/Excel', 'administrative'),
        ('settings.view', 'Ver Configuración', 'Ver configuración del sistema', 'system'),
        ('settings.update', 'Editar Configuración', 'Modificar configuración del sistema', 'system'),
    ]
    
    created_count = 0
    
    for module_key, display_name, description, category in permissions_data:
        permission = Permission(
            module_key=module_key,
            display_name=display_name,
            description=description,
            category=category
        )
        db.session.add(permission)
        created_count += 1
    
    db.session.commit()
    print(f"  ✓ Created {created_count} permissions")
    print(f"    - System: {len([p for p in permissions_data if p[3] == 'system'])} permissions")
    print(f"    - Clinical: {len([p for p in permissions_data if p[3] == 'clinical'])} permissions")
    print(f"    - Administrative: {len([p for p in permissions_data if p[3] == 'administrative'])} permissions")


def reset_database():
    """
    Drop all tables and recreate them
    """
    with app.app_context():
        print("=" * 60)
        print("DATABASE RESET SCRIPT")
        print("=" * 60)
        print("\n⚠️  WARNING: This will DELETE ALL DATA in the database!")
        print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}\n")
        
        # Ask for confirmation
        confirm = input("Are you sure you want to continue? (type 'yes' to confirm): ")
        
        if confirm.lower() != 'yes':
            print("\n❌ Operation cancelled.")
            return
        
        print("\n🗑️  Dropping all tables...")
        try:
            db.drop_all()
            print("✅ All tables dropped successfully")
        except Exception as e:
            print(f"❌ Error dropping tables: {e}")
            return
        
        print("\n🔨 Creating all tables...")
        try:
            db.create_all()
            print("✅ All tables created successfully")
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            return
        
        print("\n🌱 Seeding system permissions...")
        try:
            seed_permissions()
            print("✅ Permissions seeded successfully")
        except Exception as e:
            print(f"❌ Error seeding permissions: {e}")
            return
        
        print("\n" + "=" * 60)
        print("✅ DATABASE RESET COMPLETE")
        print("=" * 60)
        print("\nTables created:")
        print("  - organizations")
        print("  - users")
        print("  - subscriptions")
        print("  - roles")
        print("  - permissions")
        print("  - role_permissions")
        print("  - specialties")
        print("  - user_specialties")
        print("  - user_roles")
        print("\n✨ Database is now clean and ready to use!")
        print("=" * 60)

if __name__ == "__main__":
    reset_database()
