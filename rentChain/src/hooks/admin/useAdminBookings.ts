import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingService } from '@/services/booking.service';
import { toast } from 'sonner';

// Query keys
export const adminBookingKeys = {
  all: ['admin', 'bookings'] as const,
  lists: () => [...adminBookingKeys.all, 'list'] as const,
  list: (page: number, size: number) => [...adminBookingKeys.lists(), page, size] as const,
  stats: () => [...adminBookingKeys.all, 'stats'] as const,
  details: () => [...adminBookingKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminBookingKeys.details(), id] as const,
};

// List bookings hook
export const useAdminBookingsList = (page = 0, size = 20) => {
  return useQuery({
    queryKey: adminBookingKeys.list(page, size),
    queryFn: () => BookingService.adminListBookings(page, size),
  });
};

// Get booking stats hook
export const useAdminBookingStats = () => {
  return useQuery({
    queryKey: adminBookingKeys.stats(),
    queryFn: () => BookingService.adminGetBookingStats(),
  });
};

// Get booking by ID hook
export const useAdminBooking = (id: number) => {
  return useQuery({
    queryKey: adminBookingKeys.detail(id),
    queryFn: () => BookingService.getBookingById(id),
    enabled: !!id,
  });
};

// Cancel booking mutation
export const useAdminCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      BookingService.cancelBooking(id, { reason }),
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: adminBookingKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    },
  });
};