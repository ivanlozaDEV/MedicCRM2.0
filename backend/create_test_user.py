from app import app, db
from models.organization import Organization
from models.user import User
from models.role import Role
from models.user_role import UserRole
from werkzeug.security import generate_password_hash
import re

with app.app_context():
    # Crear organización de prueba
    print("🏥 Creando organización de prueba...")
    
    org_name = "Clínica San Juan"
    base_slug = re.sub(r'[^a-z0-9]+', '-', org_name.lower()).strip('-')
    
    org = Organization(
        name=org_name,
        slug=base_slug,
        is_active=True
    )
    db.session.add(org)
    db.session.flush()
    
    print(f"✅ Organización creada: {org.name}")
    print(f"📍 Slug: {org.slug}")
    print(f"🔗 URL: http://localhost:3000/{org.slug}/dashboard")
    
    # Crear usuario admin
    print("\n👤 Creando usuario admin...")
    
    user = User(
        organization_id=org.id,
        username="admin",
        email="admin@test.com",
        password_hash=generate_password_hash("admin123"),
        first_name="Admin",
        last_name="Test",
        is_active=True
    )
    db.session.add(user)
    db.session.flush()
    
    print(f"✅ Usuario creado: {user.email}")
    
    # Asignar rol de Admin
    print("\n🔐 Asignando rol de Admin...")
    
    admin_role = Role.query.filter_by(name="Admin", organization_id=org.id).first()
    if not admin_role:
        # Si no existe, buscar el rol de sistema y duplicarlo
        from seed_default_roles import seed_default_roles_for_organization
        seed_default_roles_for_organization(org.id)
        admin_role = Role.query.filter_by(name="Admin", organization_id=org.id).first()
    
    user_role = UserRole(
        user_id=user.id,
        role_id=admin_role.id,
        is_primary=True
    )
    db.session.add(user_role)
    
    db.session.commit()
    
    print(f"✅ Rol asignado: {admin_role.name}")
    print("\n" + "="*60)
    print("✨ Usuario de prueba creado exitosamente!")
    print("="*60)
    print(f"\n📧 Email: admin@test.com")
    print(f"🔑 Password: admin123")
    print(f"🏥 Organización: {org.name}")
    print(f"📍 Slug: {org.slug}")
    print(f"🔗 Login URL: http://localhost:3000/login")
    print(f"🔗 Dashboard URL: http://localhost:3000/{org.slug}/dashboard")
    print("\n" + "="*60)
