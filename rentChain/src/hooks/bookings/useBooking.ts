// src/hooks/bookings/useBooking.ts

import { useState, useEffect, useCallback } from 'react';
import { BookingService } from '@/services/booking.service';
import type { Booking } from '@/types/booking.types';

export const useBooking = (id: number | null) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.getBookingById(id);
      setBooking(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch booking');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  return { booking, loading, error, refetch: fetchBooking };
};