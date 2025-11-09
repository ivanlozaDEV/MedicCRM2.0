/**
 * Services Index
 * Centralized exports for all API services
 */

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
