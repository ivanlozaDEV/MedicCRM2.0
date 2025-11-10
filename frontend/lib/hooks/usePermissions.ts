'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useMemo, type ReactNode } from 'react'

/**
 * Custom hook for checking user permissions
 * 
 * @example
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()
 * 
 * if (hasPermission('patients.create')) {
 *   // Show create button
 * }
 */
export function usePermissions() {
  const { user, permissions: contextPermissions } = useAuth()

  // Extract all permission keys from user's roles
  const permissions = useMemo(() => {
    const permissionSet = new Set<string>()
    
    // First, try to get permissions from user.roles
    if (user?.roles && Array.isArray(user.roles)) {
      user.roles.forEach(role => {
        role.permissions?.forEach((permission: any) => {
          permissionSet.add(permission.module_key || permission.name)
        })
      })
    }
    
    // If no permissions from roles, use context permissions as fallback
    if (permissionSet.size === 0 && contextPermissions && Array.isArray(contextPermissions)) {
      contextPermissions.forEach(perm => permissionSet.add(perm))
    }
    
    return permissionSet
  }, [user?.roles, contextPermissions])

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permissionKey: string): boolean => {
    return permissions.has(permissionKey)
  }

  /**
   * Check if user has at least one of the specified permissions
   */
  const hasAnyPermission = (permissionKeys: string[]): boolean => {
    return permissionKeys.some(key => permissions.has(key))
  }

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissionKeys: string[]): boolean => {
    return permissionKeys.every(key => permissions.has(key))
  }

  /**
   * Get all user permissions as an array
   */
  const getAllPermissions = (): string[] => {
    return Array.from(permissions)
  }

  return {
    permissions: getAllPermissions(),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: !user,
  }
}

/**
 * Component for conditional rendering based on permissions
 */
interface PermissionGuardProps {
  permission: string | string[]
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission } = usePermissions()
  
  const hasAccess = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission)
  
  if (!hasAccess) {
    return fallback
  }
  
  return children
}
