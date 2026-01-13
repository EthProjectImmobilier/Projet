import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, Search } from 'lucide-react';
import type { PropertySearchParams } from '@/types/property.types';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchData, setSearchData] = useState<PropertySearchParams>({
    location: searchParams.get('location') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    propertyType: searchParams.get('propertyType') || undefined,
    amenities: searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : undefined,
    instantBookable: searchParams.get('instantBookable') === 'true' ? true : undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build query string from search data
    const params = new URLSearchParams();
    Object.entries(searchData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value.toString());
        }
      }
    });

    navigate(`/search/results?${params}`);
  };

  const updateSearchData = (field: keyof PropertySearchParams, value: any) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Perfect Stay</h1>
        <p className="text-muted-foreground">Search for properties worldwide</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="City, country, or address"
                  value={searchData.location || ''}
                  onChange={(e) => updateSearchData('location', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="guests" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Guests
                </Label>
                <Select
                  value={searchData.guests?.toString() || ''}
                  onValueChange={(value) => updateSearchData('guests', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Number of guests" />
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
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkIn" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Check-in Date
                </Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={searchData.checkIn || ''}
                  onChange={(e) => updateSearchData('checkIn', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="checkOut" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Check-out Date
                </Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={searchData.checkOut || ''}
                  onChange={(e) => updateSearchData('checkOut', e.target.value)}
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPrice">Minimum Price per Night</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="Min price"
                  value={searchData.minPrice || ''}
                  onChange={(e) => updateSearchData('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>

              <div>
                <Label htmlFor="maxPrice">Maximum Price per Night</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Max price"
                  value={searchData.maxPrice || ''}
                  onChange={(e) => updateSearchData('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={searchData.propertyType || ''}
                onValueChange={(value) => updateSearchData('propertyType', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any property type" />
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

            {/* Instant Bookable */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="instantBookable"
                checked={searchData.instantBookable || false}
                onChange={(e) => updateSearchData('instantBookable', e.target.checked || undefined)}
                className="rounded"
              />
              <Label htmlFor="instantBookable">Instant bookable properties only</Label>
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Search className="w-4 h-4 mr-2" />
              Search Properties
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};