import type { ReactNode } from 'react';

/**
 * Helper to check if user is a tenant
 * @param userRole - User role string (e.g., 'ROLE_TENANT')
 * @returns true if user is a tenant
 */
export const isTenantRole = (userRole?: string | null): boolean => {
  return userRole === 'ROLE_TENANT';
};

/**
 * Helper to check if user is an owner
 * @param userRole - User role string (e.g., 'ROLE_OWNER')
 * @returns true if user is an owner
 */
export const isOwnerRole = (userRole?: string | null): boolean => {
  return userRole === 'ROLE_OWNER';
};

/**
 * Helper to check if user is an admin
 * @param userRole - User role string (e.g., 'ROLE_ADMIN')
 * @returns true if user is an admin
 */
export const isAdminRole = (userRole?: string | null): boolean => {
  return userRole === 'ROLE_ADMIN';
};

/**
 * Helper to check if user is authenticated
 * @param user - User object
 * @returns true if user exists
 */
export const isAuthenticated = (user: any): boolean => {
  return !!user;
};

/**
 * AIGuard: Component-level guard for AI features
 * Shows children only if user meets role requirements
 * Falls back gracefully if conditions not met
 */
interface AIGuardProps {
  user: any;
  userRole?: string | null;
  requiredRole?: 'ROLE_TENANT' | 'ROLE_OWNER' | 'ROLE_ADMIN';
  children: ReactNode;
  fallback?: ReactNode;
}

export const AIGuard = ({
  user,
  userRole,
  requiredRole = 'ROLE_TENANT',
  children,
  fallback = null,
}: AIGuardProps): ReactNode => {
  // Check authentication
  if (!isAuthenticated(user)) {
    return fallback;
  }

  // Check role
  if (requiredRole === 'ROLE_TENANT' && !isTenantRole(userRole)) {
    return fallback;
  }

  if (requiredRole === 'ROLE_OWNER' && !isOwnerRole(userRole)) {
    return fallback;
  }

  if (requiredRole === 'ROLE_ADMIN' && !isAdminRole(userRole)) {
    return fallback;
  }

  return children;
};

export default AIGuard;
