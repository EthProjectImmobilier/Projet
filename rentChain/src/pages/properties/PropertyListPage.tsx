import React, { useState } from 'react';
import { usePropertyList } from '@/hooks/useProperty';
import { PropertyService } from '@/services/property.service';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PropertySummary, PropertySearchParams, PaginatedResponse } from '@/types/property.types';

export const PropertyListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [searchFilters, setSearchFilters] = useState<PropertySearchParams | null>(null);
  const [searchResults, setSearchResults] = useState<PaginatedResponse<PropertySummary> | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { data: defaultData, loading: defaultLoading, error: defaultError, refetch } = usePropertyList(page, 12);

  // Use search results if available, otherwise use default data
  const data = searchResults || defaultData;
  const loading = searchLoading || defaultLoading;
  const error = searchError || defaultError;

  const handleSearch = async (filters: PropertySearchParams) => {
    setPage(0);
    setSearchLoading(true);
    setSearchError(null);
    try {
      const result = await PropertyService.search(filters, 0, 12);
      setSearchResults(result);
      setSearchFilters(filters);
    } catch (err) {
      setSearchError('Failed to search properties');
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleReset = () => {
    setSearchFilters(null);
    setSearchResults(null);
    setSearchError(null);
    setPage(0);
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (searchFilters) {
      handleSearch(searchFilters);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Properties</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Discover Properties</h1>
        <PropertyFilters onSearch={handleSearch} onReset={handleReset} isLoading={loading} />
        
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!data || !data.content || data.content.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Discover Properties</h1>
        <PropertyFilters onSearch={handleSearch} onReset={handleReset} isLoading={loading} />
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchFilters ? 'No properties match your search criteria.' : 'No properties available.'}
          </p>
          {searchFilters && (
            <Button onClick={handleReset} variant="outline" className="mt-4">
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Discover Properties</h1>
        <p className="text-muted-foreground">
          {searchFilters ? `Found ${data?.totalElements || 0} properties` : `Showing ${data?.totalElements || 0} available properties`}
        </p>
      </div>

      <PropertyFilters onSearch={handleSearch} onReset={handleReset} isLoading={loading} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {data?.content?.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Pagination */}
      {data && data.totalPages && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <Button
            variant="outline"
            onClick={() => handlePageChange(page - 1)}
            disabled={data.first || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, data.totalPages || 1) }).map((_, i) => {
              const pageNum = Math.max(0, (data.number || 0) - 2 + i);
              if (pageNum >= (data.totalPages || 0)) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                  className="w-10"
                >
                  {pageNum + 1}
                </Button>
              );
            })}
          </div>

          <span className="text-sm text-muted-foreground px-2">
            Page {(data.number || 0) + 1} of {data.totalPages || 1}
          </span>

          <Button
            variant="outline"
            onClick={() => handlePageChange(page + 1)}
            disabled={data.last || loading}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};