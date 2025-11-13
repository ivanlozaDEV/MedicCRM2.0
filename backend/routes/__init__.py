"""
Routes package for DoctorCRM API.
Contains all blueprint routes organized by resource.
"""

from flask import Blueprint

# Import all route blueprints
from routes.auth import auth_bp
from routes.organizations import organizations_bp
from routes.users import users_bp
from routes.subscriptions import subscriptions_bp
from routes.roles import roles_bp
from routes.permissions import permissions_bp
from routes.specialties import specialties_bp
from routes.role_permissions import role_permissions_bp
from routes.user_specialties import user_specialties_bp
from routes.webhooks import webhooks_bp
from routes.patients import patients_bp
from routes.patient_contacts import patient_contacts_bp
from routes.allergies import allergies_bp
from routes.patient_allergies import patient_allergies_bp
from routes.medications import medications_bp
from routes.patient_medications import patient_medications_bp
from routes.conditions import conditions_bp
from routes.patient_conditions import patient_conditions_bp
from routes.appointment_types import appointment_types_bp
from routes.rooms import rooms_bp
from routes.doctor_schedules import doctor_schedules_bp
from routes.appointments import appointments_bp
from routes.appointment_slots import appointment_slots_bp

__all__ = [
    'auth_bp',
    'organizations_bp',
    'users_bp',
    'subscriptions_bp',
    'roles_bp',
    'permissions_bp',
    'specialties_bp',
    'role_permissions_bp',
    'user_specialties_bp',
    'webhooks_bp',
    'patients_bp',
    'patient_contacts_bp',
    'allergies_bp',
    'patient_allergies_bp',
    'medications_bp',
    'patient_medications_bp',
    'conditions_bp',
    'patient_conditions_bp',
    'appointment_types_bp',
    'rooms_bp',
    'doctor_schedules_bp',
    'appointments_bp',
    'appointment_slots_bp'
]
