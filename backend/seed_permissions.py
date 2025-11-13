"""
Seed permissions based on the 28-table structure.
This script creates all CRUD permissions for each module.
Run this after database initialization to populate permissions.
"""
from app import app
from models import db
from models.permission import Permission


def seed_permissions():
    """Create all system permissions based on the 28-table structure."""
    
    with app.app_context():
        print("🌱 Seeding permissions...")
        
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
            
            # ============ CLINICAL - PACIENTES (5 tables - FHIR compliant) ============
            # 7. Patients (FHIR Patient)
            ('patients.view', 'Ver Pacientes', 'Ver listado y expedientes de pacientes', 'clinical'),
            ('patients.create', 'Crear Pacientes', 'Registrar nuevos pacientes', 'clinical'),
            ('patients.update', 'Editar Pacientes', 'Modificar información de pacientes', 'clinical'),
            ('patients.delete', 'Eliminar Pacientes', 'Eliminar/desactivar registros de pacientes', 'clinical'),
            ('patients.activate', 'Activar Pacientes', 'Reactivar pacientes desactivados', 'clinical'),
            ('patients.stats', 'Ver Estadísticas de Pacientes', 'Ver estadísticas y reportes de pacientes', 'clinical'),
            
            # 8. Patient Contacts (FHIR RelatedPerson)
            ('patient_contacts.view', 'Ver Contactos de Emergencia', 'Ver contactos de emergencia de pacientes', 'clinical'),
            ('patient_contacts.create', 'Crear Contactos de Emergencia', 'Agregar contactos de emergencia', 'clinical'),
            ('patient_contacts.update', 'Editar Contactos de Emergencia', 'Modificar contactos de emergencia', 'clinical'),
            ('patient_contacts.delete', 'Eliminar Contactos de Emergencia', 'Eliminar contactos de emergencia', 'clinical'),
            ('patient_contacts.set_primary', 'Definir Contacto Principal', 'Marcar contacto como principal', 'clinical'),
            ('patient_contacts.reorder', 'Reordenar Contactos', 'Cambiar prioridad de contactos', 'clinical'),
            
            # 9. Patient Allergies (FHIR AllergyIntolerance)
            ('patient_allergies.view', 'Ver Alergias', 'Ver alergias e intolerancias de pacientes (FHIR)', 'clinical'),
            ('patient_allergies.create', 'Registrar Alergias', 'Registrar alergias con codificación SNOMED/RxNorm', 'clinical'),
            ('patient_allergies.update', 'Editar Alergias', 'Modificar registros de alergias', 'clinical'),
            ('patient_allergies.delete', 'Eliminar Alergias', 'Eliminar registros de alergias', 'clinical'),
            
            # 10. Patient Medications (FHIR MedicationStatement)
            ('patient_medications.view', 'Ver Medicamentos', 'Ver medicamentos actuales del paciente (FHIR)', 'clinical'),
            ('patient_medications.create', 'Registrar Medicamentos', 'Registrar medicamentos con codificación RxNorm/NDC', 'clinical'),
            ('patient_medications.update', 'Editar Medicamentos', 'Modificar información de medicamentos', 'clinical'),
            ('patient_medications.delete', 'Eliminar Medicamentos', 'Eliminar registros de medicamentos', 'clinical'),
            ('patient_medications.discontinue', 'Descontinuar Medicamentos', 'Marcar medicamentos como descontinuados', 'clinical'),
            
            # 11. Patient Conditions (FHIR Condition)
            ('patient_conditions.view', 'Ver Condiciones', 'Ver diagnósticos y condiciones del paciente (FHIR)', 'clinical'),
            ('patient_conditions.create', 'Registrar Condiciones', 'Registrar condiciones con codificación ICD-10/SNOMED', 'clinical'),
            ('patient_conditions.update', 'Editar Condiciones', 'Modificar información de condiciones', 'clinical'),
            ('patient_conditions.delete', 'Eliminar Condiciones', 'Eliminar registros de condiciones', 'clinical'),
            ('patient_conditions.resolve', 'Resolver Condiciones', 'Marcar condiciones como resueltas', 'clinical'),
            
            # ============ CLINICAL - CITAS Y CONSULTAS (9 tables) ============
            # 12. Specialties
            ('specialties.view', 'Ver Especialidades', 'Ver especialidades médicas disponibles', 'clinical'),
            ('specialties.create', 'Crear Especialidades', 'Crear nuevas especialidades médicas', 'clinical'),
            ('specialties.update', 'Editar Especialidades', 'Modificar especialidades médicas', 'clinical'),
            ('specialties.delete', 'Eliminar Especialidades', 'Eliminar especialidades médicas', 'clinical'),
            
            # 13. Appointment Types
            ('appointment_types.view', 'Ver Tipos de Cita', 'Ver tipos de cita disponibles', 'clinical'),
            ('appointment_types.create', 'Crear Tipos de Cita', 'Crear nuevos tipos de cita', 'clinical'),
            ('appointment_types.update', 'Editar Tipos de Cita', 'Modificar tipos de cita', 'clinical'),
            ('appointment_types.delete', 'Eliminar Tipos de Cita', 'Eliminar tipos de cita', 'clinical'),
            
            # 14. Rooms
            ('rooms.view', 'Ver Salas/Consultorios', 'Ver listado de salas y consultorios', 'administrative'),
            ('rooms.create', 'Crear Salas/Consultorios', 'Crear nuevas salas/consultorios', 'administrative'),
            ('rooms.update', 'Editar Salas/Consultorios', 'Modificar salas/consultorios', 'administrative'),
            ('rooms.delete', 'Eliminar Salas/Consultorios', 'Eliminar salas/consultorios', 'administrative'),
            
            # 15. Doctor Schedules
            ('doctor_schedules.view', 'Ver Horarios de Atención', 'Ver horarios de doctores', 'administrative'),
            ('doctor_schedules.create', 'Crear Horarios de Atención', 'Crear horarios para doctores', 'administrative'),
            ('doctor_schedules.update', 'Editar Horarios de Atención', 'Modificar horarios de doctores', 'administrative'),
            ('doctor_schedules.delete', 'Eliminar Horarios de Atención', 'Eliminar horarios de doctores', 'administrative'),
            
            # 16. Appointments
            ('appointments.view', 'Ver Citas', 'Ver citas agendadas', 'clinical'),
            ('appointments.create', 'Crear Citas', 'Agendar nuevas citas', 'clinical'),
            ('appointments.update', 'Editar Citas', 'Modificar o reagendar citas', 'clinical'),
            ('appointments.delete', 'Eliminar Citas', 'Cancelar/eliminar citas', 'clinical'),
            ('appointments.cancel', 'Cancelar Citas', 'Cancelar citas confirmadas', 'clinical'),
            ('appointments.check_in', 'Check-in de Citas', 'Registrar llegada de paciente', 'clinical'),
            ('appointments.check_out', 'Check-out de Citas', 'Registrar salida de paciente', 'clinical'),
            ('appointments.no_show', 'Marcar No-Show', 'Marcar paciente como ausente', 'clinical'),
            
            # 16.1 Appointment Slots
            ('appointment_slots.view', 'Ver Slots de Citas', 'Ver disponibilidad de citas', 'clinical'),
            ('appointment_slots.manage', 'Gestionar Slots', 'Generar y gestionar slots', 'administrative'),
            ('appointment_slots.block', 'Bloquear Slots', 'Bloquear horarios no disponibles', 'administrative'),
            ('appointment_slots.unblock', 'Desbloquear Slots', 'Desbloquear horarios previamente bloqueados', 'administrative'),
            
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
        updated_count = 0
        
        for module_key, display_name, description, category in permissions_data:
            existing = Permission.query.filter_by(module_key=module_key).first()
            
            if existing:
                # Update if exists
                existing.display_name = display_name
                existing.description = description
                existing.category = category
                updated_count += 1
                print(f"  ↻ Updated: {module_key}")
            else:
                # Create new
                permission = Permission(
                    module_key=module_key,
                    display_name=display_name,
                    description=description,
                    category=category
                )
                db.session.add(permission)
                created_count += 1
                print(f"  ✓ Created: {module_key}")
        
        db.session.commit()
        
        print(f"\n✅ Seeding complete!")
        print(f"   Created: {created_count} permissions")
        print(f"   Updated: {updated_count} permissions")
        print(f"   Total: {len(permissions_data)} permissions")
        
        # Show summary by category
        print(f"\n📊 Summary by category:")
        for category in ['system', 'clinical', 'administrative']:
            count = Permission.query.filter_by(category=category).count()
            print(f"   {category.title()}: {count} permissions")


if __name__ == '__main__':
    seed_permissions()
