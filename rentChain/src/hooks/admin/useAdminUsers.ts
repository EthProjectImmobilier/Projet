import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminUserService } from '@/services/adminUser.service';
import type { CreateUserData, UpdateUserProfileData } from '@/services/adminUser.service';
import { toast } from 'sonner';

// Query keys
export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (page: number, size: number) => [...adminUserKeys.lists(), page, size] as const,
  searches: () => [...adminUserKeys.all, 'search'] as const,
  search: (query: string, page: number, size: number) => [...adminUserKeys.searches(), query, page, size] as const,
  filters: () => [...adminUserKeys.all, 'filter'] as const,
  filter: (filters: any, page: number, size: number) => [...adminUserKeys.filters(), filters, page, size] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminUserKeys.details(), id] as const,
};

// List users hook
export const useUsersList = (page = 0, size = 20) => {
  return useQuery({
    queryKey: adminUserKeys.list(page, size),
    queryFn: () => AdminUserService.listUsers(page, size),
  });
};

// Search users hook
export const useUserSearch = (query: string, page = 0, size = 20) => {
  return useQuery({
    queryKey: adminUserKeys.search(query, page, size),
    queryFn: () => AdminUserService.searchUsers(query, page, size),
    enabled: query.length > 0,
  });
};

// Filter users hook
export const useUserFilters = (filters: {
  role?: string;
  city?: string;
  country?: string;
  active?: boolean;
}, page = 0, size = 20) => {
  return useQuery({
    queryKey: adminUserKeys.filter(filters, page, size),
    queryFn: () => AdminUserService.filterUsers(filters, page, size),
  });
};

// Get user by ID hook
export const useUser = (id: number) => {
  return useQuery({
    queryKey: adminUserKeys.detail(id),
    queryFn: () => AdminUserService.getUserById(id),
    enabled: !!id,
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => AdminUserService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.searches() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.filters() });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create user';
      toast.error(message);
    },
  });
};

// Update user profile mutation
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserProfileData }) =>
      AdminUserService.updateUserProfile(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      toast.success('User profile updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update user profile';
      toast.error(message);
    },
  });
};

// Enable user mutation
export const useEnableUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AdminUserService.enableUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      toast.success('User enabled successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to enable user';
      toast.error(message);
    },
  });
};

// Disable user mutation
export const useDisableUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AdminUserService.disableUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      toast.success('User disabled successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to disable user';
      toast.error(message);
    },
  });
};

// Change user role mutation
export const useChangeRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newRole }: { id: number; newRole: 'ROLE_TENANT' | 'ROLE_OWNER' | 'ROLE_ADMIN' }) =>
      AdminUserService.changeRole(id, newRole),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      toast.success('User role changed successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to change user role';
      toast.error(message);
    },
  });
};

// Force logout user mutation
export const useForceLogout = () => {
  return useMutation({
    mutationFn: (id: number) => AdminUserService.forceLogout(id),
    onSuccess: () => {
      toast.success('User logged out successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to logout user';
      toast.error(message);
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AdminUserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.searches() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.filters() });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete user';
      toast.error(message);
    },
  });
};