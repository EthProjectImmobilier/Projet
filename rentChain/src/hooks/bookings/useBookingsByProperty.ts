// src/hooks/bookings/useBookingsByProperty.ts

import { useState, useEffect, useCallback } from 'react';
import { BookingService } from '@/services/booking.service';
import type { Booking } from '@/types/booking.types';

export const useBookingsByProperty = (propertyId: number | null) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.getBookingsByProperty(propertyId);
      setBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch property bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refetch: fetchBookings };
};