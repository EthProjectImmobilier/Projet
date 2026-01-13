import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { COUNTRIES_AND_CITIES, COUNTRIES_LIST } from '@/types/location.constants';

interface CountryCitySelectorProps {
  country: string;
  city: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
}

export const CountryCitySelector: React.FC<CountryCitySelectorProps> = ({
  country,
  city,
  onCountryChange,
  onCityChange,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>(country);
  const [selectedCity, setSelectedCity] = useState<string>(city);

  const availableCities = selectedCountry ? COUNTRIES_AND_CITIES[selectedCountry] || [] : [];

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedCity('');
    onCountryChange(countryCode);
    onCityChange('');
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    onCityChange(cityName);
  };

  const selectedCountryData = COUNTRIES_LIST.find(c => c.cca2 === selectedCountry);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="country">Country</Label>
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
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

      {selectedCountry && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Selected: {selectedCountryData?.name.common}
          {selectedCity && ` - ${selectedCity}`}
        </div>
      )}
    </div>
  );
};
