// src/pages/bookings/MyBookingsPage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { useMyBookings } from '@/hooks/bookings/useMyBookings';
import { useCancelBooking } from '@/hooks/bookings/useCancelBooking';
import { CancelBookingDialog } from '@/components/bookings/CancelBookingDialog';
import type { Booking } from '@/types/booking.types';
import { formatEth } from '@/lib/utils';

export const MyBookingsPage = () => {
  const { bookings, loading, error, refetch } = useMyBookings();
  const { cancelBooking, loading: cancelLoading } = useCancelBooking();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancel = async (reason: string) => {
    if (!selectedBooking) return;
    const success = await cancelBooking(selectedBooking.id, { reason });
    if (success) {
      refetch();
      setShowCancelDialog(false);
      setSelectedBooking(null);
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

  if (loading) {
    return <div className="container mx-auto p-6">Loading bookings...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-gray-600">Manage your rental bookings</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
            <Button asChild>
              <Link to="/search">Browse Properties</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">
                    {booking.property?.title || `Property ${booking.propertyId}`}
                  </CardTitle>
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
                    <span className="text-sm">{formatEth(booking.totalPrice)} ETH</span>
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
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/bookings/${booking.id}`}>View Details</Link>
                  </Button>
                  {booking.status === 'CONFIRMED' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCancelDialog(true);
                      }}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedBooking && (
        <CancelBookingDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onConfirm={handleCancel}
          loading={cancelLoading}
        />
      )}
    </div>
  );
};