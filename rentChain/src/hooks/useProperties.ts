import { useState, useEffect } from 'react';
import { PropertyService } from '@/services/property.api';
import type { Property, CreatePropertyData } from '@/services/property.api';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await PropertyService.getAllProperties();
      const data = response.data as any;
      if (Array.isArray(data)) {
        setProperties(data);
      } else if (data && Array.isArray(data.content)) {
        setProperties(data.content);
      } else {
        setProperties([]);
      }
    } catch (err) {
      setError('Failed to fetch properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyById = async (id: number): Promise<Property | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await PropertyService.getPropertyById(id);
      return response.data;
    } catch (err) {
      setError('Failed to fetch property');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getMyProperties = async (): Promise<Property[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await PropertyService.getMyProperties();
      const data = response.data as any;
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.content)) {
        return data.content;
      } else {
        return [];
      }
    } catch (err) {
      setError('Failed to fetch my properties');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async (data: CreatePropertyData): Promise<Property | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await PropertyService.createProperty(data);
      return response.data;
    } catch (err) {
      setError('Failed to create property');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadOwnershipDocument = async (propertyId: number, file: File): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await PropertyService.uploadOwnershipDocument(propertyId, file);
      return true;
    } catch (err) {
      setError('Failed to upload document');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    loading,
    error,
    fetchProperties,
    getPropertyById,
    getMyProperties,
    createProperty,
    uploadOwnershipDocument,
  };
};