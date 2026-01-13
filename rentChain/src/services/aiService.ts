import { api as axios } from '@/lib/axios';

export interface RiskScoreResponse {
  userId: string;
  score: number; // 0-100
  risk_level: 'low' | 'medium' | 'high';
}

export interface PropertyAddress {
  street: string;
  city: string;
  state?: string | null;
  zipCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PropertyImage {
  id: number;
  imageUrl: string;
  caption: string;
  displayOrder: number;
  createdAt: string;
}

export interface PropertyRecommendation {
  id: number | string;
  title: string;
  description: string;
  type: string;
  address: PropertyAddress;
  pricePerNight: number;
  securityDeposit: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  ownerId: number;
  ownerFirstName: string;
  ownerLastName: string;
  ownerProfilePicture?: string;
  ownerWalletAddress: string;
  status: string;
  minStayNights: number;
  cancellationPolicyDays: number;
  amenities: string[];
  instantBookable: boolean;
  images: PropertyImage[];
  averageRating?: number | null;
  totalReviews: number;
  recommendationScore?: number;
}

export interface MarketForecast {
  date: string;
  price: number;
}

export interface CityAnalytics {
  city: string;
  model_used: string;
  rmse_error: number;
  forecast: MarketForecast[];
  market_cluster: string;
}

export interface MarketAnalyticsResponse {
  status: string;
  data: CityAnalytics[];
}

const AI_API_BASE = ''; // Uses existing axios with auth headers

/**
 * Get tenant risk score
 * Endpoint: GET /api/risk/me
 * Protected: Yes (Bearer JWT)
 */
export const getRiskScore = async (): Promise<RiskScoreResponse | null> => {
  try {
    const response = await axios.get<RiskScoreResponse>(`${AI_API_BASE}/risk/me`);
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch risk score:', error);
    return null;
  }
};

/**
 * Get property recommendations based on budget
 * Endpoint: GET /api/properties/recommendations?budget={budget}
 * Protected: Yes (Bearer JWT)
 */
export const getRecommendations = async (
  budget: number
): Promise<PropertyRecommendation[]> => {
  try {
    const response = await axios.get<PropertyRecommendation[]>(
      `${AI_API_BASE}/properties/recommendations`,
      {
        params: { budget },
      }
    );
    return response.data || [];
  } catch (error) {
    console.warn('Failed to fetch recommendations:', error);
    return [];
  }
};

/**
 * Get market analytics and price forecasts
 * Endpoint: GET /api/analytics/dashboard
 * Protected: No (Public)
 */
export const getMarketAnalytics = async (): Promise<CityAnalytics[]> => {
  try {
    const response = await axios.get<MarketAnalyticsResponse>(
      `${AI_API_BASE}/analytics/dashboard`
    );
    return response.data?.data || [];
  } catch (error) {
    console.warn('Failed to fetch market analytics:', error);
    return [];
  }
};
