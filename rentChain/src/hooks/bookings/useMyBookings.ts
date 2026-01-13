// src/hooks/bookings/useMyBookings.ts

import { useState, useEffect, useCallback } from 'react';
import { BookingService } from '@/services/booking.service';
import type { Booking } from '@/types/booking.types';

export const useMyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refetch: fetchBookings };
};