// src/hooks/bookings/useCreateBooking.ts

import { useState } from 'react';
import { BookingService } from '@/services/booking.service';
import type { CreateBookingData, Booking } from '@/types/booking.types';

export const useCreateBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (data: CreateBookingData): Promise<Booking | null> => {
    setLoading(true);
    setError(null);
    try {
      const booking = await BookingService.createBooking(data);
      return booking;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, loading, error };
};