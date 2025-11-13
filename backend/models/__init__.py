from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models
from models.organization import Organization
from models.user import User
from models.subscription import Subscription
from models.role import Role
from models.permission import Permission
from models.specialty import Specialty
from models.role_permission import RolePermission
from models.user_specialty import UserSpecialty
from models.user_role import UserRole
from models.patient import Patient
from models.patient_contact import PatientContact
from models.allergy import Allergy
from models.patient_allergy import PatientAllergy
from models.medication import Medication
from models.patient_medication import PatientMedication
from models.condition import Condition
from models.patient_condition import PatientCondition
from models.appointment_type import AppointmentType
from models.room import Room
from models.doctor_schedule import DoctorSchedule
from models.appointment import Appointment
from models.appointment_slot import AppointmentSlot

__all__ = [
    'db',
    'Organization',
    'User',
    'Subscription',
    'Role',
    'Permission',
    'Specialty',
    'RolePermission',
    'UserSpecialty',
    'UserRole',
    'Patient',
    'PatientContact',
    'Allergy',
    'PatientAllergy',
    'Medication',
    'PatientMedication',
    'Condition',
    'PatientCondition',
    'AppointmentType',
    'Room',
    'DoctorSchedule',
    'Appointment',
    'AppointmentSlot'
]

