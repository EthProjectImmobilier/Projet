import { api } from "@/lib/axios";

export interface Property {
  id: number;
  title: string;
  description: string;
    type: string;
    address: {
    street: string;
    city: string;
    country: string;
    zipCode: string;
  };
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  minStayNights: number;
  securityDeposit?: number;
  cancellationPolicyDays: number;
  instantBookable: boolean;
  ownershipDocumentUrl?: string;
}

export interface CreatePropertyData {
  title: string;
  description: string;
  type: string;
  address: {
    street: string;
    city: string;
    country: string;
    zipCode: string;
  };
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  minStayNights: number;
  securityDeposit?: number;
  cancellationPolicyDays: number;
  instantBookable: boolean;
  ownershipDocumentUrl?: string;
}

export const PropertyService = {
  getAllProperties() {
    return api.get<Property[]>("/properties");
  },

  getMyProperties() {
    return api.get<Property[]>("/properties/me");
  },

  getPropertyById(id: number) {
    return api.get<Property>(`/properties/${id}`);
  },

  createProperty(data: CreatePropertyData) {
    return api.post<Property>("/properties", data);
  },

  updateProperty(id: number, data: Partial<CreatePropertyData>) {
    return api.put<Property>(`/properties/${id}`, data);
  },

  deleteProperty(id: number) {
    return api.delete<void>(`/properties/${id}`);
  },
  uploadOwnershipDocument(propertyId: number, file: File) {
    return api.post(`/properties/${propertyId}/ownership-document`, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};