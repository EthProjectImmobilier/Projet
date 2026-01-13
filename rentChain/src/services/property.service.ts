// src/services/property.service.ts

import { api } from '@/lib/axios';
import type {
  Property,
  PropertySummary,
  PropertySearchParams,
  PaginatedResponse,
  CreatePropertyData,
  UpdatePropertyData,
  PropertyImage,
  Review,
  AvailabilityResult,
  BookingInfo,
  AdminStats,
  BlockDatesData,
  ReviewData,
} from '@/types/property.types';

export class PropertyService {
  // Public endpoints
  static async list(page = 0, size = 20): Promise<PaginatedResponse<PropertySummary>> {
    const response = await api.get(`/properties?page=${page}&size=${size}`);
    return response.data;
  }

  static async getById(id: number): Promise<Property> {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  }

  static async search(params: PropertySearchParams, page = 0, size = 20): Promise<PaginatedResponse<PropertySummary>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
      ),
    });
    const response = await api.get(`/properties/search?${queryParams}`);
    // Backend returns wrapped response with properties key
    return response.data.properties || response.data;
  }

  static async searchText(q: string, page = 0, size = 20): Promise<PaginatedResponse<PropertySummary>> {
    const response = await api.get(`/properties/search/text?q=${encodeURIComponent(q)}&page=${page}&size=${size}`);
    // Backend returns wrapped response with properties key
    return response.data.properties || response.data;
  }

  static async getImages(id: number): Promise<PropertyImage[]> {
    const response = await api.get(`/properties/${id}/images`);
    return response.data;
  }

  static async getBookingInfo(id: number, startDate: string, endDate: string): Promise<BookingInfo> {
    const response = await api.get(`/properties/${id}/booking-info?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  static async getSuggestedPrice(id: number, startDate: string, endDate: string): Promise<{ suggestedPrice: number }> {
    const response = await api.get(`/properties/${id}?date=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  // Owner endpoints (Auth required)
  static async create(data: CreatePropertyData): Promise<Property> {
    const response = await api.post('/properties', data);
    return response.data;
  }

  static async getMyProperties(page = 0, size = 20): Promise<PaginatedResponse<PropertySummary>> {
    const response = await api.get(`/properties/me?page=${page}&size=${size}`);
    return response.data;
  }

  static async update(id: number, data: UpdatePropertyData): Promise<Property> {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/properties/${id}`);
  }

  static async uploadOwnershipDocument(id: number, file: File): Promise<{ documentUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/properties/${id}/ownership-document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  static async uploadImage(id: number, file: File, altText?: string): Promise<PropertyImage> {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    const response = await api.post(`/properties/${id}/images/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  static async reorderImages(id: number, imageIds: number[]): Promise<void> {
    await api.put(`/properties/${id}/images/reorder`, { imageIds });
  }

  static async deleteImage(id: number, imageId: number): Promise<void> {
    await api.delete(`/properties/${id}/images/${imageId}`);
  }

  static async updateImage(imageId: number, data: { caption?: string }): Promise<PropertyImage> {
    const response = await api.put(`/properties/images/${imageId}`, data);
    return response.data;
  }

  static async setMainImage(id: number, imageId: number): Promise<void> {
    await api.put(`/properties/${id}/images/${imageId}/set-main`);
  }

  static async blockDates(id: number, data: BlockDatesData): Promise<void> {
    await api.post(`/properties/${id}/availability/block`, data);
  }

  static async unblockDates(id: number, data: BlockDatesData): Promise<void> {
    await api.post(`/properties/${id}/availability/unblock`, data);
  }

  static async checkAvailability(id: number, startDate: string, endDate: string): Promise<AvailabilityResult> {
    const response = await api.get(`/properties/${id}/availability/check?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  static async getUnavailableDates(id: number): Promise<string[]> {
    const response = await api.get(`/properties/${id}/availability/unavailable-dates`);
    return response.data;
  }

  // Tenant endpoints
  static async postReview(id: number, data: ReviewData): Promise<Review> {
    const response = await api.post(`/properties/${id}/reviews`, data);
    return response.data;
  }

  static async getReviews(id: number, page = 0, size = 10): Promise<PaginatedResponse<Review>> {
    const response = await api.get(`/properties/${id}/reviews?page=${page}&size=${size}`);
    return response.data;
  }

  // Admin endpoints
  static async adminList(page = 0, size = 20): Promise<PaginatedResponse<Property>> {
    const response = await api.get(`/admin/properties?page=${page}&size=${size}`);
    return response.data;
  }

  static async adminApprove(id: number): Promise<void> {
    await api.post(`/admin/properties/${id}/approve`);
  }

  static async adminReject(id: number, reason: string): Promise<void> {
    await api.post(`/admin/properties/${id}/reject?reason=${encodeURIComponent(reason)}`);
  }

  static async adminDelete(id: number): Promise<void> {
    await api.delete(`/admin/properties/${id}`);
  }

  static async adminStats(): Promise<AdminStats> {
    const response = await api.get('/admin/properties/stats');
    return response.data;
  }

  static async adminGetReviews(page = 0, size = 20): Promise<PaginatedResponse<Review>> {
    const response = await api.get(`/admin/reviews?page=${page}&size=${size}`);
    return response.data;
  }

  static async adminDeleteReview(id: number): Promise<void> {
    await api.delete(`/admin/reviews/${id}`);
  }
}