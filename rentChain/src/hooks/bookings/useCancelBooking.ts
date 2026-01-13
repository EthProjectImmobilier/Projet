// src/hooks/bookings/useCancelBooking.ts

import { useState } from 'react';
import { BookingService } from '@/services/booking.service';
import type { CancelBookingData } from '@/types/booking.types';

export const useCancelBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelBooking = async (id: number, data: CancelBookingData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await BookingService.cancelBooking(id, data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { cancelBooking, loading, error };
};