// src/hooks/bookings/useOwnerStats.ts

import { useState, useEffect, useCallback } from 'react';
import { BookingService } from '@/services/booking.service';
import type { OwnerStats } from '@/types/booking.types';

export const useOwnerStats = () => {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.getOwnerStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch owner stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};