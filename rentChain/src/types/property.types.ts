// src/types/property.types.ts

export interface PropertyAddress {
  street: string;
  city: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

export interface PropertyImage {
  id: number;
  imageUrl: string;
  caption?: string;
  displayOrder: number;
  createdAt: string;
}

export interface Review {
  id: number;
  propertyId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
}

export interface BookingInfo {
  propertyId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  available: boolean;
  blockedDates: string[];
}

export interface AdminStats {
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  totalReviews: number;
  propertiesByType: Record<string, number>;
}

export interface PropertySummary {
  id: number;
  title: string;
  type: string;
  address: PropertyAddress;
  pricePerNight: number;
  pricePerNightEth: number;
  suggestedPricePerNight?: number;
  suggestedPricePerNightEth?: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  instantBookable: boolean;
  images: PropertyImage[];
  averageRating?: number;
  status: 'ACTIVE' | 'PENDING_ADMIN' | 'REJECTED';
  ownerId: number;
  ownerFirstName: string;
  ownerLastName: string;
  ownerProfilePicture?: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  type: string;
  address: PropertyAddress;
  pricePerNight: number;
  pricePerNightEth: number;
  suggestedPricePerNight?: number;
  suggestedPricePerNightEth?: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  minStayNights: number;
  securityDeposit?: number;
  cancellationPolicyDays: number;
  instantBookable: boolean;
  ownershipDocumentUrl?: string;
  images: PropertyImage[];
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'PENDING_ADMIN' | 'REJECTED';
  ownerId: number;
  ownerWalletAddress?: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerProfilePicture?: string;
}

export interface PropertySearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  amenities?: string[];
  instantBookable?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CreatePropertyData {
  title: string;
  description: string;
  type: string;
  address: PropertyAddress;
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

export interface UpdatePropertyData extends Partial<CreatePropertyData> {}

export interface BlockDatesData {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface ReviewData {
  rating: number;
  comment: string;
}

export interface OwnerProfileProperty {
  id: number;
  title: string;
  description: string;
  type: string;
  pricePerNight: number;
  status: string;
  amenities: string[];
}

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  walletVerified: boolean;
  role: 'ROLE_TENANT' | 'ROLE_OWNER' | 'ROLE_ADMIN';
  description?: string;
  dateNaissance?: string;
  country?: string;
  city?: string;
  phone?: string;
  walletAddress?: string;
  photoUrl?: string;
  kycRectoUrl?: string;
  kycVersoUrl?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface UserProfileResponse {
  userInfo: UserProfile;
  properties: OwnerProfileProperty[];
}

export interface AdminProperty {
  id: number;
  title: string;
  description: string;
  type: string;
  address: {
    street: string;
    city: string;
    state: string | null;
    zipCode: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  pricePerNight: number;
  securityDeposit: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  ownerId: number;
  ownerFirstName: string;
  ownerLastName: string;
  ownerProfilePicture: string;
  ownerWalletAddress: string;
  ownershipDocumentUrl: string | null;
  status: 'ACTIVE' | 'PENDING_ADMIN' | 'REJECTED';
  minStayNights: number;
  cancellationPolicyDays: number;
  amenities: string[];
  instantBookable: boolean;
  suggestedPricePerNight: number | null;
  createdAt: string;
  updatedAt: string;
  images: PropertyImage[];
  averageRating: number | null;
  totalReviews: number;
}