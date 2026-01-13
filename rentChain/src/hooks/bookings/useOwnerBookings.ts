// src/hooks/bookings/useOwnerBookings.ts

import { useState, useEffect, useCallback } from 'react';
import { BookingService } from '@/services/booking.service';
import type { Booking } from '@/types/booking.types';

export const useOwnerBookings = (status?: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.getOwnerBookings(status);
      setBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch owner bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refetch: fetchBookings };
};