// src/pages/bookings/BookingDetailsPage.tsx

import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Users, DollarSign, ArrowLeft } from 'lucide-react';
import { useBooking } from '@/hooks/bookings/useBooking';
import { useCancelBooking } from '@/hooks/bookings/useCancelBooking';
import { CancelBookingDialog } from '@/components/bookings/CancelBookingDialog';
import { useState } from 'react';
import { formatEth, ethToUsd, formatUsd } from '@/lib/utils';

export const BookingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const bookingId = id ? parseInt(id) : null;
  const { booking, loading, error } = useBooking(bookingId);
  const { cancelBooking, loading: cancelLoading } = useCancelBooking();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancel = async (reason: string) => {
    if (!booking) return;
    const success = await cancelBooking(booking.id, { reason });
    if (success) {
      window.location.reload(); // Simple refresh, could be improved with navigation
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
    return <div className="container mx-auto p-6">Loading booking details...</div>;
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600 mb-4">{error || 'Booking not found'}</div>
        <Button asChild variant="outline">
          <Link to="/bookings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Bookings
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button asChild variant="outline" className="mb-4">
          <Link to="/bookings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Bookings
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Booking Details</h1>
        <p className="text-gray-600">Booking #{booking.id}</p>
      </div>

      <div className="grid gap-6">
        <Card>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Check-in</p>
                    <p className="text-sm text-gray-600">{booking.checkIn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Check-out</p>
                    <p className="text-sm text-gray-600">{booking.checkOut}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Guests</p>
                    <p className="text-sm text-gray-600">{booking.numberOfGuests}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Total Price</p>
                    <p className="text-lg font-semibold">{formatEth(booking.totalPrice)} ETH</p>
                    <p className="text-sm text-gray-600">≈ {formatUsd(ethToUsd(booking.totalPrice))}</p>
                  </div>
                </div>
                {booking.property?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-gray-600">
                        {booking.property.address.street}<br />
                        {booking.property.address.city}, {booking.property.address.country}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Created</p>
              <p className="text-sm text-gray-600">
                {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Separator />
            <div>
              <p className="font-medium">Last Updated</p>
              <p className="text-sm text-gray-600">
                {new Date(booking.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {booking.cancellationReason && (
              <>
                <Separator />
                <div>
                  <p className="font-medium text-red-600">Cancellation Reason</p>
                  <p className="text-sm text-gray-600">{booking.cancellationReason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {booking.status === 'CONFIRMED' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <CancelBookingDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancel}
        loading={cancelLoading}
      />
    </div>
  );
};