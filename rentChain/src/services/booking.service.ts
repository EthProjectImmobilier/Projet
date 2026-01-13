// src/services/booking.service.ts

import { api } from '@/lib/axios';
import type {
  Booking,
  CreateBookingData,
  CancelBookingData,
  OwnerStats,
} from '@/types/booking.types';
import type { PaginatedResponse } from '@/types/property.types';

export class BookingService {
  // Tenant endpoints
  static async createBooking(data: CreateBookingData): Promise<Booking> {
    const response = await api.post('/bookings', data);
    return response.data;
  }

  static async getMyBookings(): Promise<Booking[]> {
    const response = await api.get('/bookings/me');
    return response.data;
  }

  static async getBookingById(id: number): Promise<Booking> {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  }

  static async cancelBooking(id: number, data: CancelBookingData): Promise<void> {
    await api.post(`/bookings/${id}/cancel`, data);
  }

  // Owner endpoints
  static async getOwnerBookings(status?: string): Promise<Booking[]> {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/bookings/owner${params}`);
    return response.data;
  }

  static async getBookingsByProperty(propertyId: number): Promise<Booking[]> {
    const response = await api.get(`/bookings/property/${propertyId}`);
    return response.data;
  }

  static async getOwnerStats(): Promise<OwnerStats> {
    const response = await api.get('/bookings/owner/stats');
    return response.data;
  }

  // Admin endpoints
  static async adminListBookings(page = 0, size = 20): Promise<PaginatedResponse<Booking>> {
    const response = await api.get(`/admin/bookings?page=${page}&size=${size}`);
    return response.data;
  }

  static async adminGetBookingStats(): Promise<{
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
  }> {
    const response = await api.get('/admin/bookings/stats');
    return response.data;
  }
}