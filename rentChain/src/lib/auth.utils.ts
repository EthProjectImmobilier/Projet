import type { User } from '@/store/auth.store';

/**
 * Role type for easier typing
 */
export type UserRole = 'ROLE_TENANT' | 'ROLE_OWNER' | 'ROLE_ADMIN';

/**
 * Helper functions for role checking
 */
export const roleHelpers = {
  isTenant: (user: User | undefined): user is User & { role: 'ROLE_TENANT' } => {
    return user?.role === 'ROLE_TENANT';
  },

  isOwner: (user: User | undefined): user is User & { role: 'ROLE_OWNER' } => {
    return user?.role === 'ROLE_OWNER';
  },

  isAdmin: (user: User | undefined): user is User & { role: 'ROLE_ADMIN' } => {
    return user?.role === 'ROLE_ADMIN';
  },

  hasRole: (user: User | undefined, roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  },

  isAnyRole: (user: User | undefined, ...roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  },
};

/**
 * Menu item configuration based on role
 */
export interface MenuItem {
  label: string;
  href: string;
  icon?: string;
  roles: UserRole[] | 'ALL'; // 'ALL' means available to all authenticated users
}

export const menuItems: MenuItem[] = [
  // Public navigation
  { label: 'Home', href: '/', roles: 'ALL' },
  { label: 'Properties', href: '/properties', roles: 'ALL' },
  { label: 'Map', href: '/map', roles: 'ALL' },

  // Authenticated only
  { label: 'Profile', href: '/profile', roles: ['ROLE_TENANT', 'ROLE_OWNER', 'ROLE_ADMIN'] },

  // Tenant only
  { label: 'My Bookings', href: '/bookings', roles: ['ROLE_TENANT'] },

  // Owner only
  { label: 'List a Property', href: '/owner/properties/new', roles: ['ROLE_OWNER'] },
  { label: 'My Properties', href: '/owner/properties', roles: ['ROLE_OWNER'] },
  { label: 'Booking Requests', href: '/owner/bookings', roles: ['ROLE_OWNER'] },

  // Admin only
  { label: 'Dashboard', href: '/admin', roles: ['ROLE_ADMIN'] },
  { label: 'Users', href: '/admin/users', roles: ['ROLE_ADMIN'] },
  { label: 'Properties', href: '/admin/properties', roles: ['ROLE_ADMIN'] },
  { label: 'Bookings', href: '/admin/bookings', roles: ['ROLE_ADMIN'] },
  { label: 'Reviews', href: '/admin/reviews', roles: ['ROLE_ADMIN'] },
];

/**
 * Filter menu items based on user authentication and role
 */
export const getVisibleMenuItems = (isAuthenticated: boolean, user: User | undefined): MenuItem[] => {
  return menuItems.filter((item) => {
    // Public items (ALL)
    if (item.roles === 'ALL') {
      return true;
    }

    // Authenticated items - must be logged in and have matching role
    if (Array.isArray(item.roles)) {
      return isAuthenticated && user && item.roles.includes(user.role);
    }

    return false;
  });
};
