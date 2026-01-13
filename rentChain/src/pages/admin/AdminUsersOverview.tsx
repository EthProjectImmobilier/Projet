import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  MoreHorizontal,
  UserPlus,
  Eye,
  UserCheck,
  UserX,
  Trash2,
  LogOut,
  Shield
} from 'lucide-react';
import { useUsersList, useUserSearch, useUserFilters, useEnableUser, useDisableUser, useChangeRole, useForceLogout, useDeleteUser } from '@/hooks/admin/useAdminUsers';
import type { AdminUser } from '@/services/adminUser.service';

export const AdminUsersOverview: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Determine which query to use based on search/filter state
  const hasSearch = searchQuery.length > 2;
  const hasFilters = roleFilter !== 'all' || statusFilter !== 'all' || countryFilter || cityFilter;

  const usersListQuery = useUsersList(page, 20);
  const userSearchQuery = useUserSearch(searchQuery, page, 20);
  const userFiltersQuery = useUserFilters({
    role: roleFilter !== 'all' ? roleFilter : undefined,
    city: cityFilter || undefined,
    country: countryFilter || undefined,
    active: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
  }, page, 20);

  // Choose the active query
  const activeQuery = hasSearch ? userSearchQuery : hasFilters ? userFiltersQuery : usersListQuery;
  const { data, isLoading, error } = activeQuery;

  // Mutations
  const enableUserMutation = useEnableUser();
  const disableUserMutation = useDisableUser();
  const changeRoleMutation = useChangeRole();
  const forceLogoutMutation = useForceLogout();
  const deleteUserMutation = useDeleteUser();

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });
  const [roleChangeDialog, setRoleChangeDialog] = useState<{ open: boolean; user: AdminUser | null; newRole: string }>({
    open: false,
    user: null,
    newRole: '',
  });

  const handleEnableUser = async (userId: number) => {
    await enableUserMutation.mutateAsync(userId);
  };

  const handleDisableUser = async (userId: number) => {
    await disableUserMutation.mutateAsync(userId);
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    await changeRoleMutation.mutateAsync({ id: userId, newRole: newRole as any });
    setRoleChangeDialog({ open: false, user: null, newRole: '' });
  };

  const handleForceLogout = async (userId: number) => {
    await forceLogoutMutation.mutateAsync(userId);
  };

  const handleDeleteUser = async (userId: number) => {
    await deleteUserMutation.mutateAsync(userId);
    setDeleteDialog({ open: false, user: null });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'destructive';
      case 'ROLE_OWNER': return 'default';
      case 'ROLE_TENANT': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Admin';
      case 'ROLE_OWNER': return 'Owner';
      case 'ROLE_TENANT': return 'Tenant';
      default: return role;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load users</p>
            <Button onClick={() => activeQuery.refetch()} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage platform users and their permissions</p>
          </div>
          <Button onClick={() => navigate('/admin/users/create')}>
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                  <SelectItem value="ROLE_OWNER">Owner</SelectItem>
                  <SelectItem value="ROLE_TENANT">Tenant</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Country"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
              />
              <Input
                placeholder="City"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({data?.totalElements || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.content.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={`${user.firstName} ${user.lastName}`} />
                            <AvatarFallback>
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.city && user.country ? `${user.city}, ${user.country}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? 'default' : 'secondary'}>
                          {user.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {user.active ? (
                              <DropdownMenuItem onClick={() => handleDisableUser(user.id)}>
                                <UserX className="h-4 w-4 mr-2" />
                                Disable User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleEnableUser(user.id)}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Enable User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setRoleChangeDialog({ open: true, user, newRole: '' })}>
                              <Shield className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleForceLogout(user.id)}>
                              <LogOut className="h-4 w-4 mr-2" />
                              Force Logout
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteDialog({ open: true, user })}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {data.page * data.size + 1} to {Math.min((data.page + 1) * data.size, data.totalElements)} of {data.totalElements} users
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {page + 1} of {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= data.totalPages - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog.user?.firstName} {deleteDialog.user?.lastName}?
              This action cannot be undone and will permanently remove the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.user && handleDeleteUser(deleteDialog.user.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Change Dialog */}
      <AlertDialog
        open={roleChangeDialog.open}
        onOpenChange={(open) => setRoleChangeDialog({ open, user: null, newRole: '' })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Change the role for {roleChangeDialog.user?.firstName} {roleChangeDialog.user?.lastName}.
              This will affect their permissions on the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={roleChangeDialog.newRole} onValueChange={(value) => setRoleChangeDialog({ ...roleChangeDialog, newRole: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROLE_TENANT">Tenant</SelectItem>
                <SelectItem value="ROLE_OWNER">Owner</SelectItem>
                <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roleChangeDialog.user && roleChangeDialog.newRole && handleChangeRole(roleChangeDialog.user.id, roleChangeDialog.newRole)}
              disabled={!roleChangeDialog.newRole}
            >
              Change Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};