import { useQuery } from '@tanstack/react-query';
import type {
  RiskScoreResponse,
  PropertyRecommendation,
  CityAnalytics,
} from '@/services/aiService';
import {
  getRiskScore,
  getRecommendations,
  getMarketAnalytics,
} from '@/services/aiService';

/**
 * Hook: Fetch tenant risk score
 * Caching: 10 minutes
 * Enabled: Only for authenticated tenants
 */
export const useRiskScore = (enabled: boolean = true) => {
  return useQuery<RiskScoreResponse | null>({
    queryKey: ['ai', 'riskScore'],
    queryFn: getRiskScore,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime)
    enabled,
    retry: 1,
  });
};

/**
 * Hook: Fetch property recommendations
 * Caching: 5 minutes
 * Enabled: Only for authenticated tenants
 * Invalidates: When budget changes
 */
export const usePropertyRecommendations = (
  budget: number,
  enabled: boolean = true
) => {
  return useQuery<PropertyRecommendation[]>({
    queryKey: ['ai', 'recommendations', budget],
    queryFn: () => getRecommendations(budget),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    enabled: enabled && budget > 0,
    retry: 1,
  });
};

/**
 * Hook: Fetch market analytics and price forecasts
 * Caching: 24 hours
 * Public: No auth required
 * Note: Can be used on home page and search results
 */
export const useMarketAnalytics = (enabled: boolean = true) => {
  return useQuery<CityAnalytics[]>({
    queryKey: ['ai', 'marketAnalytics'],
    queryFn: getMarketAnalytics,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 25 * 60 * 60 * 1000, // 25 hours (formerly cacheTime)
    enabled,
    retry: 1,
  });
};
