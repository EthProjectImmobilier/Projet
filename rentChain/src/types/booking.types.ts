// src/types/booking.types.ts

export interface Booking {
  id: number;
  propertyId: number;
  tenantId: number;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  numberOfGuests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  property?: {
    id: number;
    title: string;
    address: {
      street: string;
      city: string;
      country: string;
    };
  };
  tenant?: {
    id: number;
    name: string;
    email: string;
  };
  cancellationReason?: string;
}

export interface CreateBookingData {
  propertyId: number;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  numberOfGuests: number;
}

export interface CancelBookingData {
  reason: string;
}

export interface OwnerStats {
  totalBookings: number;
  revenue: number;
  cancellations: number;
  occupancyRate: number;
  // Add more as needed
}