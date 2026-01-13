import { PropertyService } from './property.service';
import { AdminUserService } from './adminUser.service';
import { BookingService } from './booking.service';

export interface AdminDashboardStats {
  // User stats
  totalUsers: number;
  activeUsers: number;
  tenantUsers: number;
  ownerUsers: number;
  adminUsers: number;

  // Property stats
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  rejectedProperties: number;

  // Booking stats (placeholder - would need backend support)
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;

  // Review stats
  totalReviews: number;
  averageRating: number;
}

export class AdminStatsService {
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      // Get property stats
      const propertyStats = await PropertyService.adminStats();

      // Get user stats (simplified - in real app, backend would provide aggregated stats)
      const usersResponse = await AdminUserService.listUsers(0, 1); // Just get pagination info
      const totalUsers = usersResponse.totalElements;

      // Get booking stats (mock for now - would need backend endpoint)
      let bookingStats = { totalBookings: 0, activeBookings: 0, completedBookings: 0 };
      try {
        bookingStats = await BookingService.adminGetBookingStats();
      } catch (error) {
        // Booking stats endpoint might not exist yet, use mock data
        console.warn('Booking stats endpoint not available, using mock data');
      }

      // For now, return mock data for reviews
      // In a real implementation, these would come from dedicated admin stats endpoints
      return {
        totalUsers,
        activeUsers: Math.floor(totalUsers * 0.8), // Mock: 80% active
        tenantUsers: Math.floor(totalUsers * 0.6), // Mock: 60% tenants
        ownerUsers: Math.floor(totalUsers * 0.35), // Mock: 35% owners
        adminUsers: Math.floor(totalUsers * 0.05), // Mock: 5% admins

        totalProperties: propertyStats.totalProperties,
        activeProperties: propertyStats.activeProperties || 0,
        pendingProperties: propertyStats.pendingProperties || 0,
        rejectedProperties: propertyStats.rejectedProperties || 0,

        totalBookings: bookingStats.totalBookings,
        activeBookings: bookingStats.activeBookings,
        completedBookings: bookingStats.completedBookings,

        totalReviews: 0, // Would need backend endpoint
        averageRating: 0, // Would need backend endpoint
      };
    } catch (error) {
      console.error('Failed to fetch admin dashboard stats:', error);
      throw error;
    }
  }
}