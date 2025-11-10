"""
Migration script to update existing organization roles with new FHIR permissions.
Run this after adding new permissions to seed_permissions.py

Usage:
    python migrations/update_existing_roles_fhir.py
"""
from models import db
from models.organization import Organization
from models.role import Role
from models.permission import Permission
from models.role_permission import RolePermission


def update_existing_roles_with_fhir_permissions():
    """
    Update existing roles with new FHIR patient permissions.
    Only updates system roles (is_system=True) to avoid modifying custom roles.
    """
    print("\n🔄 Updating existing roles with FHIR permissions...")
    
    # New FHIR permissions to add to each role
    role_permissions_map = {
        'Administrador': [
            # All patient permissions (already has them, no changes needed)
        ],
        'Doctor': [
            # Patient Allergies
            'patient_allergies.view',
            'patient_allergies.create',
            'patient_allergies.update',
            'patient_allergies.delete',
            # Patient Medications
            'patient_medications.view',
            'patient_medications.create',
            'patient_medications.update',
            'patient_medications.delete',
            'patient_medications.discontinue',
            # Patient Conditions
            'patient_conditions.view',
            'patient_conditions.create',
            'patient_conditions.update',
            'patient_conditions.delete',
            'patient_conditions.resolve',
            # Enhanced patient permissions
            'patients.activate',
            'patients.stats',
            'patient_contacts.set_primary',
            'patient_contacts.reorder',
        ],
        'Enfermera': [
            # Patient Allergies (view only, no delete)
            'patient_allergies.view',
            'patient_allergies.create',
            'patient_allergies.update',
            # Patient Medications (view/create/update, no discontinue)
            'patient_medications.view',
            'patient_medications.create',
            'patient_medications.update',
            # Patient Conditions (view/create/update, no resolve)
            'patient_conditions.view',
            'patient_conditions.create',
            'patient_conditions.update',
            # Enhanced patient permissions
            'patients.activate',
            'patient_contacts.set_primary',
            'patient_contacts.reorder',
        ],
        'Recepcionista': [
            # Only administrative permissions (no clinical data)
            'patients.activate',
            'patient_contacts.set_primary',
            'patient_contacts.reorder',
        ],
        'Contador': [
            # No patient clinical permissions needed
        ],
    }
    
    # Remove old permissions that don't exist anymore
    old_permissions = [
        'allergies.view',
        'allergies.create',
        'allergies.update',
        'allergies.delete',
        'chronic_conditions.view',
        'chronic_conditions.create',
        'chronic_conditions.update',
        'chronic_conditions.delete',
    ]
    
    # Get all organizations
    organizations = Organization.query.all()
    total_orgs = len(organizations)
    print(f"📊 Found {total_orgs} organizations to update")
    
    updated_roles = 0
    skipped_roles = 0
    
    for org in organizations:
        print(f"\n🏢 Processing organization: {org.name} (ID: {org.id})")
        
        # Get all system roles for this organization
        system_roles = Role.query.filter_by(
            organization_id=org.id,
            is_system=True
        ).all()
        
        for role in system_roles:
            if role.name not in role_permissions_map:
                print(f"  ⏭️  Skipping role: {role.name} (not in update map)")
                skipped_roles += 1
                continue
            
            print(f"  🔧 Updating role: {role.name}")
            
            # Remove old permissions
            for old_perm_key in old_permissions:
                old_perm = Permission.query.filter_by(module_key=old_perm_key).first()
                if old_perm:
                    RolePermission.query.filter_by(
                        role_id=role.id,
                        permission_id=old_perm.id
                    ).delete()
                    print(f"     ❌ Removed: {old_perm_key}")
            
            # Add new permissions
            new_perms = role_permissions_map[role.name]
            added_count = 0
            
            for perm_key in new_perms:
                permission = Permission.query.filter_by(module_key=perm_key).first()
                
                if not permission:
                    print(f"     ⚠️  Permission not found: {perm_key} (run seed_permissions.py first)")
                    continue
                
                # Check if role already has this permission
                existing = RolePermission.query.filter_by(
                    role_id=role.id,
                    permission_id=permission.id
                ).first()
                
                if existing:
                    continue  # Already has it
                
                # Add permission to role
                role_permission = RolePermission(
                    role_id=role.id,
                    permission_id=permission.id
                )
                db.session.add(role_permission)
                added_count += 1
                print(f"     ✅ Added: {perm_key}")
            
            print(f"  📦 Added {added_count} new permissions to {role.name}")
            updated_roles += 1
    
    # Commit all changes
    try:
        db.session.commit()
        print(f"\n✅ Migration complete!")
        print(f"   📊 Organizations processed: {total_orgs}")
        print(f"   ✅ Roles updated: {updated_roles}")
        print(f"   ⏭️  Roles skipped: {skipped_roles}")
    except Exception as e:
        db.session.rollback()
        print(f"\n❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    from app import app
    
    with app.app_context():
        print("=" * 60)
        print("🔄 FHIR Permissions Migration Script")
        print("=" * 60)
        
        # Verify permissions exist first
        print("\n🔍 Verifying new FHIR permissions exist...")
        test_perms = [
            'patient_allergies.view',
            'patient_medications.view',
            'patient_conditions.view',
        ]
        
        missing_perms = []
        for perm_key in test_perms:
            perm = Permission.query.filter_by(module_key=perm_key).first()
            if not perm:
                missing_perms.append(perm_key)
        
        if missing_perms:
            print(f"\n❌ Missing permissions: {missing_perms}")
            print("⚠️  Please run 'python seed_permissions.py' first!")
            exit(1)
        
        print("✅ All required permissions found")
        
        # Confirm before proceeding
        response = input("\n⚠️  This will modify existing roles. Continue? (yes/no): ")
        if response.lower() != 'yes':
            print("❌ Migration cancelled")
            exit(0)
        
        # Run migration
        update_existing_roles_with_fhir_permissions()
        
        print("\n" + "=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
