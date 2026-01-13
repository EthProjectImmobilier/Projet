import { api } from '@/lib/axios';

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  active: boolean;
  walletAddress?: string;
  role: 'ROLE_TENANT' | 'ROLE_OWNER' | 'ROLE_ADMIN';
  city?: string;
  country?: string;
  dateNaissance?: string;
  createdAt: string;
  emailVerified?: boolean;
  walletVerified?: boolean;
  description?: string;
  photoUrl?: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'ROLE_TENANT' | 'ROLE_OWNER' | 'ROLE_ADMIN';
  country?: string;
  city?: string;
  dateNaissance?: string;
  password: string;
}

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  description?: string;
  phone?: string;
  city?: string;
  country?: string;
  dateNaissance?: string;
  role?: 'ROLE_TENANT' | 'ROLE_OWNER' | 'ROLE_ADMIN';
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const AdminUserService = {
  // List users with pagination
  listUsers(page = 0, size = 20): Promise<PaginatedResponse<AdminUser>> {
    return api.get(`/admin/users?page=${page}&size=${size}`).then(res => res.data);
  },

  // Search users by keyword
  searchUsers(query: string, page = 0, size = 20): Promise<PaginatedResponse<AdminUser>> {
    return api.get(`/admin/users/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`).then(res => res.data);
  },

  // Filter users by criteria
  filterUsers(filters: {
    role?: string;
    city?: string;
    country?: string;
    active?: boolean;
  }, page = 0, size = 20): Promise<PaginatedResponse<AdminUser>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null)
      ),
    });
    return api.get(`/admin/users?${params}`).then(res => res.data);
  },

  // Get user by ID
  getUserById(id: number): Promise<AdminUser> {
    return api.get(`/admin/users/${id}`).then(res => res.data);
  },

  // Create new user
  createUser(data: CreateUserData): Promise<AdminUser> {
    return api.post('/admin/users', data).then(res => res.data);
  },

  // Update user profile
  updateUserProfile(id: number, data: UpdateUserProfileData): Promise<AdminUser> {
    return api.put(`/admin/users/${id}/profile`, data).then(res => res.data);
  },

  // Enable user
  enableUser(id: number): Promise<void> {
    return api.put(`/admin/users/${id}/enable`);
  },

  // Disable user
  disableUser(id: number): Promise<void> {
    return api.put(`/admin/users/${id}/disable`);
  },

  // Change user role
  changeRole(id: number, newRole: 'ROLE_TENANT' | 'ROLE_OWNER' | 'ROLE_ADMIN'): Promise<void> {
    return api.put(`/admin/users/${id}/role?newRole=${newRole}`);
  },

  // Force logout user
  forceLogout(id: number): Promise<void> {
    return api.post(`/admin/users/${id}/force-logout`);
  },

  // Delete user
  deleteUser(id: number): Promise<void> {
    return api.delete(`/admin/users/${id}`);
  },
};