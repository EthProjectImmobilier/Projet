// src/pages/owner/OwnerBookingsPage.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, DollarSign, User, Wallet } from 'lucide-react';
import { useOwnerBookings } from '@/hooks/bookings/useOwnerBookings';
import { useReleaseFunds } from '@/hooks/useReleaseFunds';
import { toast } from 'sonner';
import { authStore } from '@/store/auth.store';
import type { Booking } from '@/types/booking.types';

export const OwnerBookingsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { bookings, loading, error } = useOwnerBookings(statusFilter);
  const { releaseFunds, isLoading: releasingFunds } = useReleaseFunds();

  const handleReleaseFunds = async (booking: Booking) => {
    const ownerAddress = authStore.getState().walletAddress;

    if (!ownerAddress) {
      toast.error('Wallet address not found. Please connect your wallet.');
      return;
    }

    // Calculate amount in Wei directly to avoid floating point issues
    // 2000 USD = 1 ETH = 10^18 Wei
    // So 1 USD = 10^18 / 2000 Wei = 5 * 10^14 Wei
    const UsdToWei = BigInt('500000000000000'); // 5 * 10^14
    const amountWei = BigInt(Math.floor(booking.totalPrice)) * UsdToWei;

    try {
      await releaseFunds({
        bookingId: booking.id,
        toAddress: ownerAddress,
        amountWei,
      });

      toast.success('Funds released successfully!');
    } catch {
      // Error is already handled in the hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = statusFilter
    ? bookings.filter(booking => booking.status === statusFilter)
    : bookings;

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading bookings...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Property Bookings</h1>
        <p className="text-gray-600">Manage bookings for your properties</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-sm text-gray-600">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <p className="text-sm text-gray-600">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmed ({stats.confirmed})</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled ({stats.cancelled})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter || 'all'} className="mt-6">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  {statusFilter ? `No ${statusFilter.toLowerCase()} bookings found.` : 'No bookings found for your properties.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {booking.property?.title || `Property ${booking.propertyId}`}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {booking.tenant?.name || `Tenant ${booking.tenantId}`}
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {booking.checkIn} to {booking.checkOut}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.numberOfGuests} guests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">${booking.totalPrice}</span>
                      </div>
                      {booking.property?.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {booking.property.address.city}, {booking.property.address.country}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {booking.status === 'PENDING' && (
                        <>
                          <Button variant="default" size="sm">
                            Confirm
                          </Button>
                          <Button variant="destructive" size="sm">
                            Reject
                          </Button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleReleaseFunds(booking)}
                          disabled={releasingFunds}
                          className="gap-2"
                        >
                          <Wallet className="h-4 w-4" />
                          {releasingFunds ? 'Releasing...' : 'Release Funds'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};