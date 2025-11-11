/**
 * Services Index
 * Centralized exports for all API services
 */

export { authService } from './authService';
export type { LoginData, SignupData, AuthResponse, CurrentUserResponse } from './authService';

export { organizationService } from './organizationService';
export type { Organization, OrganizationStats } from './organizationService';

export { userService } from './userService';
export type { User, CreateUserData } from './userService';

export { subscriptionService } from './subscriptionService';
export type { Subscription } from './subscriptionService';

export { roleService } from './roleService';
export type { Role } from './roleService';

export { permissionService } from './permissionService';
export type { Permission, PermissionsGrouped } from './permissionService';

export { specialtyService } from './specialtyService';
export type { Specialty } from './specialtyService';

export { rolePermissionService } from './rolePermissionService';
export type { RolePermission } from './rolePermissionService';

export { userSpecialtyService } from './userSpecialtyService';
export type { UserSpecialty } from './userSpecialtyService';

export { patientService } from './patientService';
export type { Patient, CreatePatientData, UpdatePatientData, PatientStats } from './patientService';

export { patientContactService } from './patientContactService';
export type { PatientContact, CreatePatientContactData, UpdatePatientContactData } from './patientContactService';

export { patientAllergyService } from './patientAllergyService';
export type { PatientAllergy, CreatePatientAllergyData, UpdatePatientAllergyData } from './patientAllergyService';

export { allergyService } from './allergyService';
export type { Allergy, CreateAllergyData, UpdateAllergyData } from './allergyService';

export { patientMedicationService } from './patientMedicationService';
export type { PatientMedication, CreatePatientMedicationData, UpdatePatientMedicationData } from './patientMedicationService';

export { patientConditionService } from './patientConditionService';
export type { PatientCondition, CreatePatientConditionData, UpdatePatientConditionData } from './patientConditionService';
