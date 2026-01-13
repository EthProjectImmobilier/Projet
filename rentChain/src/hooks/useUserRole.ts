import { useEffect, useState } from 'react';
import { authStore } from '@/store/auth.store';
import { isTenantRole, isOwnerRole, isAdminRole } from '@/lib/aiGuard.utils';

/**
 * Hook to extract and track user role from auth store
 * Provides convenient role checking functions
 */
export const useUserRole = () => {
  const { user } = authStore();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Extract role from user object
      // Adjust the property name based on your actual auth store structure
      const role = (user as any).role || (user as any).userRole || null;
      setUserRole(role);
    } else {
      setUserRole(null);
    }
  }, [user]);

  return {
    user,
    userRole,
    isTenant: isTenantRole(userRole),
    isOwner: isOwnerRole(userRole),
    isAdmin: isAdminRole(userRole),
  };
};

export default useUserRole;
