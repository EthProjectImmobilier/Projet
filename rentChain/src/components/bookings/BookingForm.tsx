// src/components/bookings/BookingForm.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Star, Lock } from 'lucide-react';
import { useCreateBooking } from '@/hooks/bookings/useCreateBooking';
import { BookingCalendar } from './BookingCalendar';
import { PaymentComponent } from './PaymentComponent';
import { authStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { ethToUsd } from '@/lib/utils';
import type { Property } from '@/types/property.types';

interface BookingFormProps {
  property: Property;
  averageRating?: number;
  reviewCount?: number;
  unavailableDates?: string[];
}

export const BookingForm = ({ property, averageRating, reviewCount, unavailableDates = [] }: BookingFormProps) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [bookingCreated, setBookingCreated] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const { createBooking, loading } = useCreateBooking();
  const navigate = useNavigate();
  const { user } = authStore();

  // Check if user is tenant
  const isTenant = user?.role === 'ROLE_TENANT';
  const isAuthenticated = !!user;

  const handleDateRangeSelect = (newCheckIn: string, newCheckOut: string) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    const bookingData = {
      propertyId: property.id,
      checkIn,
      checkOut,
      numberOfGuests: guests,
    };

    const result = await createBooking(bookingData);
    if (result) {
      toast.success('Booking created successfully!');
      setCreatedBookingId(result.id); // Assuming result has id
      setBookingCreated(true);
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const usdPrice = ethToUsd(property.pricePerNight);
    const subtotal = nights * usdPrice;
    const serviceFee = Math.round(subtotal * 0.14); // 14% service fee
    const securityDeposit = property.securityDeposit || 0;
    return subtotal + serviceFee + securityDeposit;
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment completed! Your booking is confirmed.');
    navigate('/bookings');
  };

  const ethRate = 2000; // 1 ETH = 2000 USD
  const total = calculateTotal();
  const amountInEth = total / ethRate;
  const nights = calculateNights();

  // Don't show anything if not a tenant
  if (!isTenant) {
    if (!isAuthenticated) {
      return (
        <Card className="sticky top-8 shadow-lg border-0 bg-card">
          <CardContent className="p-6 text-center">
            <Lock className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Sign in to book</h3>
            <p className="text-sm text-muted-foreground mb-4">You need to be logged in as a tenant to book this property.</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="sticky top-8 shadow-lg border-0 bg-card">
        <CardContent className="p-6 text-center">
          <Lock className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Booking not available</h3>
          <p className="text-sm text-muted-foreground">
            Only tenants can book properties. If you're an owner, switch to your tenant account to book.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (bookingCreated && createdBookingId && property.ownerWalletAddress) {
    return (
      <PaymentComponent
        amount={amountInEth}
        recipientAddress={property.ownerWalletAddress}
        bookingId={createdBookingId}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  return (
    <div className="sticky top-8 space-y-4">
      {/* Price Card */}
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-2xl font-bold">{property.pricePerNight.toFixed(4)} ETH</span>
              <span className="text-muted-foreground ml-1">night</span>
              <div className="text-sm text-muted-foreground">≈ ${ethToUsd(property.pricePerNight).toLocaleString()}</div>
            </div>
            {averageRating && reviewCount && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{averageRating.toFixed(1)} ({reviewCount})</span>
              </div>
            )}
          </div>

          {/* Guests Selection */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Guests
            </label>
            <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: property.maxGuests }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} guest{i !== 0 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          {nights > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="underline">${ethToUsd(property.pricePerNight).toFixed(0)} × {nights} nights</span>
                  <span>${(ethToUsd(property.pricePerNight) * nights).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Service fee</span>
                  <span>${Math.round(ethToUsd(property.pricePerNight) * nights * 0.14)}</span>
                </div>
                {property.securityDeposit && property.securityDeposit > 0 && (
                  <div className="flex justify-between">
                    <span className="underline">Security deposit</span>
                    <span>${property.securityDeposit}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Calendar */}
      {(
        <BookingCalendar
          unavailableDates={unavailableDates}
          onDateRangeSelect={handleDateRangeSelect}
          selectedCheckIn={checkIn}
          selectedCheckOut={checkOut}
          minNights={property.minStayNights}
        />
      )}

      {/* Book Button */}
      <form onSubmit={handleSubmit}>
        <Button type="submit" className="w-full mb-3" size="lg" disabled={loading || !checkIn || !checkOut}>
          {loading ? 'Creating Booking...' : (property.instantBookable ? 'Reserve' : 'Request to book')}
        </Button>

        {!property.instantBookable && (
          <p className="text-xs text-muted-foreground text-center">
            You won't be charged yet
          </p>
        )}
      </form>
    </div>
  );
};