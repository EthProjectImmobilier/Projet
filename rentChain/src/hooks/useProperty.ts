// src/hooks/useProperty.ts

import { useState, useEffect, useCallback } from 'react';
import { PropertyService } from '@/services/property.service';
import type {
  Property,
  PropertySummary,
  PropertySearchParams,
  PaginatedResponse,
  PropertyImage,
  Review,
} from '@/types/property.types';

export const usePropertyList = (page = 0, size = 20) => {
  const [data, setData] = useState<PaginatedResponse<PropertySummary> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await PropertyService.list(page, size);
      setData(result);
    } catch (err) {
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export const usePropertyDetails = (id: number | null) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await PropertyService.getById(id);
      setProperty(result);
    } catch (err) {
      setError('Failed to fetch property details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { property, loading, error, refetch: fetch };
};

export const usePropertySearch = (params: PropertySearchParams, page = 0, size = 20) => {
  const [data, setData] = useState<PaginatedResponse<PropertySummary> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await PropertyService.search(params, page, size);
      setData(result);
    } catch (err) {
      setError('Failed to search properties');
    } finally {
      setLoading(false);
    }
  }, [params, page, size]);

  return { data, loading, error, search };
};

export const usePropertySearchText = (q: string, page = 0, size = 20) => {
  const [data, setData] = useState<PaginatedResponse<PropertySummary> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await PropertyService.searchText(q, page, size);
      setData(result);
    } catch (err) {
      setError('Failed to search properties');
    } finally {
      setLoading(false);
    }
  }, [q, page, size]);

  return { data, loading, error, search };
};

export const useMyProperties = (page = 0, size = 20) => {
  const [data, setData] = useState<PaginatedResponse<PropertySummary> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await PropertyService.getMyProperties(page, size);
      setData(result);
    } catch (err) {
      setError('Failed to fetch my properties');
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export const usePropertyImages = (id: number | null) => {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await PropertyService.getImages(id);
      setImages(result);
    } catch (err) {
      setError('Failed to fetch images');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { images, loading, error, refetch: fetch };
};

export const usePropertyReviews = (id: number | null, page = 0, size = 10) => {
  const [data, setData] = useState<PaginatedResponse<Review> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await PropertyService.getReviews(id, page, size);
      setData(result);
    } catch (err) {
      setError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [id, page, size]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export const usePropertyAvailability = (id: number | null) => {
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await PropertyService.getUnavailableDates(id);
      setUnavailableDates(result);
    } catch (err) {
      setError('Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { unavailableDates, loading, error, refetch: fetch };
};