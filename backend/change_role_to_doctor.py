#!/usr/bin/env python3
"""
Script para cambiar el rol del usuario actual a Doctor
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models.user import User
from models.role import Role
from models.user_role import UserRole

def change_to_doctor():
    with app.app_context():
        # Get first user (probablemente tú)
        user = User.query.first()
        
        if not user:
            print("❌ No hay usuarios en la base de datos")
            return
        
        print(f"👤 Usuario encontrado: {user.email}")
        print(f"   Organización ID: {user.organization_id}")
        
        # Get Doctor role for this organization
        doctor_role = Role.query.filter_by(
            organization_id=user.organization_id,
            name='Doctor'
        ).first()
        
        if not doctor_role:
            print("❌ No existe el rol Doctor para esta organización")
            return
        
        print(f"👨‍⚕️ Rol Doctor encontrado (ID: {doctor_role.id})")
        
        # Remove all current roles
        UserRole.query.filter_by(user_id=user.id).delete()
        print("   Roles anteriores eliminados")
        
        # Assign Doctor role
        user_role = UserRole(user_id=user.id, role_id=doctor_role.id)
        db.session.add(user_role)
        db.session.commit()
        
        print(f"✅ Usuario {user.email} ahora tiene el rol Doctor")
        print(f"   Permisos: {len(doctor_role.permissions or [])} permisos")

if __name__ == '__main__':
    change_to_doctor()
