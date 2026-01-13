import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, UserCheck, UserX, Shield, LogOut } from 'lucide-react';
import { useUser, useUpdateUserProfile, useEnableUser, useDisableUser, useChangeRole, useForceLogout } from '@/hooks/admin/useAdminUsers';

export const AdminUserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = id ? parseInt(id) : null;

  const { data: user, isLoading, error } = useUser(userId!);
  const updateProfileMutation = useUpdateUserProfile();
  const enableUserMutation = useEnableUser();
  const disableUserMutation = useDisableUser();
  const changeRoleMutation = useChangeRole();
  const forceLogoutMutation = useForceLogout();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    description: '',
    city: '',
    country: '',
    dateNaissance: '',
    role: 'ROLE_TENANT' as 'ROLE_TENANT' | 'ROLE_OWNER' | 'ROLE_ADMIN',
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        description: user.description || '',
        city: user.city || '',
        country: user.country || '',
        dateNaissance: user.dateNaissance || '',
        role: user.role,
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!userId) return;

    try {
      await updateProfileMutation.mutateAsync({
        id: userId,
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          description: formData.description,
          city: formData.city,
          country: formData.country,
          dateNaissance: formData.dateNaissance,
          role: formData.role,
        },
      });
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEnableUser = async () => {
    if (!userId) return;
    await enableUserMutation.mutateAsync(userId);
  };

  const handleDisableUser = async () => {
    if (!userId) return;
    await disableUserMutation.mutateAsync(userId);
  };

  const handleChangeRole = async (newRole: string) => {
    if (!userId) return;
    await changeRoleMutation.mutateAsync({ id: userId, newRole: newRole as any });
  };

  const handleForceLogout = async () => {
    if (!userId) return;
    await forceLogoutMutation.mutateAsync(userId);
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error?.message || 'User not found'}</p>
            <Button onClick={() => navigate('/admin/users')} className="mt-4">Back to Users</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/users')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{user.firstName} {user.lastName}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {getRoleDisplayName(user.role)}
              </Badge>
              <Badge variant={user.active ? 'default' : 'secondary'}>
                {user.active ? 'Active' : 'Inactive'}
              </Badge>
              {user.emailVerified && (
                <Badge variant="outline" className="text-green-600">
                  ✓ Email Verified
                </Badge>
              )}
              {user.walletVerified && (
                <Badge variant="outline" className="text-green-600">
                  ✓ Wallet Verified
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {user.active ? (
              <Button variant="outline" onClick={handleDisableUser}>
                <UserX className="w-4 h-4 mr-2" />
                Disable
              </Button>
            ) : (
              <Button variant="outline" onClick={handleEnableUser}>
                <UserCheck className="w-4 h-4 mr-2" />
                Enable
              </Button>
            )}
            <Button variant="outline" onClick={handleForceLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Force Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={updateProfileMutation.isPending}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    'Edit Profile'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dateNaissance">Date of Birth</Label>
                <Input
                  id="dateNaissance"
                  type="date"
                  value={formData.dateNaissance}
                  onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROLE_TENANT">Tenant</SelectItem>
                    <SelectItem value="ROLE_OWNER">Owner</SelectItem>
                    <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>User ID</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{user.id}</p>
                </div>
                <div>
                  <Label>Wallet Address</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                    {user.walletAddress || 'Not connected'}
                  </p>
                </div>
              </div>
              <div>
                <Label>Joined</Label>
                <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Avatar */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={user.photoUrl} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="text-2xl">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge variant={getRoleBadgeVariant(user.role)} className="mt-2">
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleChangeRole(user.role === 'ROLE_ADMIN' ? 'ROLE_OWNER' : user.role === 'ROLE_OWNER' ? 'ROLE_TENANT' : 'ROLE_OWNER')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Change Role
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleForceLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Force Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};