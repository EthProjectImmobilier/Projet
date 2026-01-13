import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PropertyService } from '@/services/property.service';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';
import type { PropertySummary, PropertySearchParams, PaginatedResponse } from '@/types/property.types';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<PaginatedResponse<PropertySummary> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Parse search parameters
  const currentSearchParams: PropertySearchParams = {
    location: searchParams.get('location') || undefined,
    checkIn: searchParams.get('checkIn') || undefined,
    checkOut: searchParams.get('checkOut') || undefined,
    guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    propertyType: searchParams.get('propertyType') || undefined,
    amenities: searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : undefined,
    instantBookable: searchParams.get('instantBookable') === 'true' ? true : undefined,
  };

  const performSearch = async (searchPage = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await PropertyService.search(currentSearchParams, searchPage, 12);
      setResults(response);
      setPage(searchPage);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [searchParams]);

  const handleFilterChange = (key: keyof PropertySearchParams, value: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === '') {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.set(key, value.join(','));
    } else {
      newParams.set(key, value.toString());
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Object.values(currentSearchParams).some(value =>
    value !== undefined && value !== null && value !== ''
  );

  if (loading && !results) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
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

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Search Results</h1>
          {results && (
            <p className="text-muted-foreground">
              {results.totalElements} properties found
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={() => navigate('/search')}>
            <Search className="w-4 h-4 mr-2" />
            New Search
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium">Price per Night</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={currentSearchParams.minPrice || ''}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={currentSearchParams.maxPrice || ''}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="text-sm font-medium">Property Type</label>
                    <Select
                      value={currentSearchParams.propertyType || ''}
                      onValueChange={(value) => handleFilterChange('propertyType', value || undefined)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOUSE">House</SelectItem>
                        <SelectItem value="APARTMENT">Apartment</SelectItem>
                        <SelectItem value="LOFT">Loft</SelectItem>
                        <SelectItem value="STUDIO">Studio</SelectItem>
                        <SelectItem value="CASTLE">Castle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="text-sm font-medium">Guests</label>
                    <Select
                      value={currentSearchParams.guests?.toString() || ''}
                      onValueChange={(value) => handleFilterChange('guests', value ? parseInt(value) : undefined)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Any number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 guest</SelectItem>
                        <SelectItem value="2">2 guests</SelectItem>
                        <SelectItem value="3">3 guests</SelectItem>
                        <SelectItem value="4">4 guests</SelectItem>
                        <SelectItem value="5">5 guests</SelectItem>
                        <SelectItem value="6">6+ guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Instant Bookable */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="instantBookable"
                      checked={currentSearchParams.instantBookable || false}
                      onChange={(e) => handleFilterChange('instantBookable', e.target.checked || undefined)}
                      className="rounded"
                    />
                    <label htmlFor="instantBookable" className="text-sm font-medium">
                      Instant bookable only
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        <div className="flex-1">
          {error && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <p className="text-red-600">{error}</p>
                <Button onClick={() => performSearch(page)} className="mt-2">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {!results || results.content.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No properties found</h2>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters.
              </p>
              <Button onClick={() => navigate('/search')}>
                <Search className="w-4 h-4 mr-2" />
                New Search
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {results.content.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Pagination */}
              {results.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => performSearch(page - 1)}
                    disabled={results.first}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Page {results.number + 1} of {results.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() => performSearch(page + 1)}
                    disabled={results.last}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};