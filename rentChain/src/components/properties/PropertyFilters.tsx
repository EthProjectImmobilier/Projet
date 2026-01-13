import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { PROPERTY_TYPES, COUNTRIES_AND_CITIES, COUNTRIES_LIST } from '@/types/location.constants';
import { ethToUsd, formatUsd } from '@/lib/utils';
import type { PropertySearchParams } from '@/types/property.types';

interface PropertyFiltersProps {
  onSearch: (filters: PropertySearchParams) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({ onSearch, onReset, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [filters, setFilters] = useState<PropertySearchParams>({});

  // Get available cities for the selected country
  const availableCities = selectedCountry ? COUNTRIES_AND_CITIES[selectedCountry] || [] : [];

  const handleLocationChange = (countryCode: string, city?: string) => {
    setSelectedCountry(countryCode);
    if (city) {
      setSelectedCity(city);
      setFilters({ ...filters, location: city || undefined });
    } else {
      setSelectedCity('');
      setFilters({ ...filters, location: undefined });
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setFilters({ ...filters, location: city || undefined });
  };

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, checkIn: e.target.value || undefined });
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, checkOut: e.target.value || undefined });
  };

  const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : undefined;
    setFilters({ ...filters, guests: value });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    setFilters({ ...filters, minPrice: value });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    setFilters({ ...filters, maxPrice: value });
  };

  const handlePropertyTypeChange = (type: string) => {
    const typeValue = type.toUpperCase();
    if (filters.propertyType === typeValue) {
      setFilters({ ...filters, propertyType: undefined });
    } else {
      setFilters({ ...filters, propertyType: typeValue });
    }
  };

  const handleInstantBookChange = () => {
    setFilters({ ...filters, instantBookable: !filters.instantBookable });
  };

  const handleSearch = () => {
    setIsExpanded(true); // Keep filters visible after search
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true));

  return (
    <Card className="mb-6">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              {hasActiveFilters ? `${Object.values(filters).filter((v) => v).length} filter(s) applied` : 'No filters applied'}
            </CardDescription>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </CardHeader>

      {isExpanded && (
        <>
          <Separator />
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Quick Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={selectedCountry} onValueChange={(code) => handleLocationChange(code)}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES_LIST.map((country) => (
                        <SelectItem key={country.cca2} value={country.cca2}>
                          {country.name.common}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {availableCities.length > 0 && (
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Select value={selectedCity} onValueChange={handleCityChange}>
                      <SelectTrigger id="city">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="checkIn">Check-in</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={filters.checkIn || ''}
                    onChange={handleCheckInChange}
                  />
                </div>

                <div>
                  <Label htmlFor="checkOut">Check-out</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={filters.checkOut || ''}
                    onChange={handleCheckOutChange}
                  />
                </div>

                <div>
                  <Label htmlFor="guests">Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    placeholder="Number of guests"
                    value={filters.guests || ''}
                    onChange={handleGuestsChange}
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleSearch} disabled={isLoading} className="w-full">
                    Search
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Advanced Filters */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Advanced Filters</h3>

                {/* Price Range */}
                <div className="mb-6">
                  <Label className="text-base font-semibold mb-3 block">Price Range (per night)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minPrice" className="text-sm">
                        Min Price (ETH / USD)
                      </Label>
                      <div className="flex flex-col gap-1">
                        <Input
                          id="minPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Min ETH"
                          value={filters.minPrice || ''}
                          onChange={handleMinPriceChange}
                        />
                        {filters.minPrice && (
                          <span className="text-xs text-muted-foreground">
                            ≈ ${formatUsd(ethToUsd(filters.minPrice))}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="maxPrice" className="text-sm">
                        Max Price (ETH / USD)
                      </Label>
                      <div className="flex flex-col gap-1">
                        <Input
                          id="maxPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Max ETH"
                          value={filters.maxPrice || ''}
                          onChange={handleMaxPriceChange}
                        />
                        {filters.maxPrice && (
                          <span className="text-xs text-muted-foreground">
                            ≈ ${formatUsd(ethToUsd(filters.maxPrice))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div className="mb-6">
                  <Label className="text-base font-semibold mb-3 block">Property Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PROPERTY_TYPES.map((type) => (
                      <Button
                        key={type}
                        variant={filters.propertyType === type.toUpperCase() ? 'default' : 'outline'}
                        onClick={() => handlePropertyTypeChange(type)}
                        className="justify-start"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Instant Bookable */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.instantBookable || false}
                      onChange={handleInstantBookChange}
                      className="rounded"
                    />
                    <span className="font-semibold">Instant Bookable Only</span>
                  </label>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={isLoading} className="flex-1">
                  Apply Filters
                </Button>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleReset} className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};
