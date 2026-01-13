// src/pages/owner/OwnerStatsPage.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Calendar, XCircle, BarChart3 } from 'lucide-react';
import { useOwnerStats } from '@/hooks/bookings/useOwnerStats';

export const OwnerStatsPage = () => {
  const { stats, loading, error } = useOwnerStats();

  if (loading) {
    return <div className="container mx-auto p-6">Loading stats...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-red-600">{error}</div>;
  }

  if (!stats) {
    return <div className="container mx-auto p-6 text-gray-500">No stats available</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Booking Statistics</h1>
        <p className="text-gray-600">Overview of your property bookings</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold">{stats.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-3xl font-bold">${stats.revenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-3xl font-bold">{stats.occupancyRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancellations</p>
                <p className="text-3xl font-bold">{stats.cancellations}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Booking Value</span>
                <span className="font-semibold">
                  ${stats.totalBookings > 0 ? (stats.revenue / stats.totalBookings).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cancellation Rate</span>
                <span className="font-semibold">
                  {stats.totalBookings > 0 ? ((stats.cancellations / stats.totalBookings) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue per Booking</span>
                <span className="font-semibold">
                  ${stats.totalBookings > 0 ? (stats.revenue / stats.totalBookings).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.occupancyRate >= 80 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    High Occupancy
                  </Badge>
                  <span className="text-sm">Your properties are performing well!</span>
                </div>
              )}
              {stats.cancellations > stats.totalBookings * 0.1 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    High Cancellations
                  </Badge>
                  <span className="text-sm">Consider reviewing your cancellation policy</span>
                </div>
              )}
              {stats.revenue > 10000 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Top Earner
                  </Badge>
                  <span className="text-sm">Great revenue performance!</span>
                </div>
              )}
              {stats.totalBookings === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <p>No bookings yet. Start by listing your properties!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};