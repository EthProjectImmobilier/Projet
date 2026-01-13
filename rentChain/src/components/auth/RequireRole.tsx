import React from 'react';
import { Navigate } from 'react-router-dom';
import { authStore } from '@/store/auth.store';

interface RequireRoleProps {
  children: React.ReactNode;
  roles: Array<'ROLE_TENANT' | 'ROLE_OWNER' | 'ROLE_ADMIN'>;
}

/**
 * Route guard component that protects pages based on user role
 * - Redirects unauthenticated users to /login
 * - Redirects authenticated users with wrong role to /
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ children, roles }) => {
  const { isAuthenticated, user } = authStore();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role - redirect to home
  if (user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Correct role - render children
  return <>{children}</>;
};
