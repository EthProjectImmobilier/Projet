import React, { useState, useEffect } from 'react';
import { AdminStatsService } from '@/services/adminStats.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  XCircle,
  Users,
  UserCheck,
  Calendar,
  Star,
  Shield,
  Building,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AdminDashboardStats } from '@/services/adminStats.service';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminStatsService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform statistics and activity
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchStats} variant="outline" className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {stats && (
        <>
          {/* Platform Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Users */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeUsers} active
                  </p>
                </CardContent>
              </Card>

              {/* Total Properties */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Building className="w-5 h-5 text-green-500" />
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Total Properties</p>
                  <p className="text-2xl font-bold">{stats.totalProperties}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeProperties} active
                  </p>
                </CardContent>
              </Card>

              {/* Total Bookings */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeBookings} active
                  </p>
                </CardContent>
              </Card>

              {/* Average Rating */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                  <p className="text-2xl font-bold">
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalReviews} reviews
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* User Management Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Active Users */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <UserCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                  <p className="text-xs text-muted-foreground">
                    {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>

              {/* Tenant Users */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Tenants</p>
                  <p className="text-2xl font-bold">{stats.tenantUsers}</p>
                  <p className="text-xs text-muted-foreground">
                    {((stats.tenantUsers / stats.totalUsers) * 100).toFixed(1)}% of users
                  </p>
                </CardContent>
              </Card>

              {/* Owner Users */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Building className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Property Owners</p>
                  <p className="text-2xl font-bold">{stats.ownerUsers}</p>
                  <p className="text-xs text-muted-foreground">
                    {((stats.ownerUsers / stats.totalUsers) * 100).toFixed(1)}% of users
                  </p>
                </CardContent>
              </Card>

              {/* Admin Users */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Administrators</p>
                  <p className="text-2xl font-bold">{stats.adminUsers}</p>
                  <p className="text-xs text-muted-foreground">
                    {((stats.adminUsers / stats.totalUsers) * 100).toFixed(1)}% of users
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Property Management Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Property Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Active Properties */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Active Properties</p>
                  <p className="text-2xl font-bold">{stats.activeProperties}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalProperties > 0 ? ((stats.activeProperties / stats.totalProperties) * 100).toFixed(1) : 0}% approved
                  </p>
                </CardContent>
              </Card>

              {/* Pending Approvals */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    {stats.pendingProperties > 0 && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                        {stats.pendingProperties}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
                  <p className="text-2xl font-bold">{stats.pendingProperties}</p>
                  <p className="text-xs text-muted-foreground">
                    Awaiting review
                  </p>
                </CardContent>
              </Card>

              {/* Rejected Properties */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Rejected Properties</p>
                  <p className="text-2xl font-bold">{stats.rejectedProperties}</p>
                  <p className="text-xs text-muted-foreground">
                    Need revision
                  </p>
                </CardContent>
              </Card>

              {/* Total Properties */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Total Listed</p>
                  <p className="text-2xl font-bold">{stats.totalProperties}</p>
                  <p className="text-xs text-muted-foreground">
                    All property listings
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* User Management */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">User Management</h4>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
                      View All Users
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/users/new')}>
                      Create New User
                    </Button>
                  </div>
                </div>

                {/* Property Management */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Property Management</h4>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/properties')}>
                      View All Properties
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/admin/properties?page=0&status=PENDING_ADMIN')}
                      disabled={stats.pendingProperties === 0}
                    >
                      Review Pending ({stats.pendingProperties})
                    </Button>
                  </div>
                </div>

                {/* Content Management */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Content Management</h4>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/reviews')}>
                      Manage Reviews
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/bookings')}>
                      View Bookings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};