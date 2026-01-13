import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Fix for leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icon for current location
const currentLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  address: string;
  onLocationChange: (lat: number, lng: number) => void;
}

interface MapClickerProps {
  onLocationChange: (lat: number, lng: number) => void;
}

const MapClicker: React.FC<MapClickerProps> = ({ onLocationChange }) => {
  useMapEvents({
    click(e: any) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
}) => {
  const [searchAddress, setSearchAddress] = useState(address);
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([latitude || 0, longitude || 0]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([latitude || 0, longitude || 0]);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);

  // Get user's current location on component mount
  useEffect(() => {
    if (latitude === 0 && longitude === 0) {
      getCurrentLocation();
    }
  }, [latitude, longitude]);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setIsGettingCurrentLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const location: [number, number] = [lat, lng];
        setCurrentLocation(location);
        setMarkerPosition(location);
        setMapCenter(location);
        onLocationChange(lat, lng);
        setIsLoadingLocation(false);
        setIsGettingCurrentLocation(false);
      },
      (error) => {
        console.warn('Could not get user location:', error);
        // Fallback to a default location (e.g., center of the world)
        const defaultLat = 20;
        const defaultLng = 0;
        const defaultLocation: [number, number] = [defaultLat, defaultLng];
        setMarkerPosition(defaultLocation);
        setMapCenter(defaultLocation);
        setIsLoadingLocation(false);
        setIsGettingCurrentLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`
      );
      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon } = results[0];
        const newLat = parseFloat(lat);
        const newLon = parseFloat(lon);
        setMarkerPosition([newLat, newLon]);
        setMapCenter([newLat, newLon]);
        handleLocationChange(newLat, newLon);
      }
    } catch (error) {
      console.error('Error searching address:', error);
    }
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      setMarkerPosition(currentLocation);
      setMapCenter(currentLocation);
      handleLocationChange(currentLocation[0], currentLocation[1]);
    } else {
      getCurrentLocation();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="searchAddress">Search Location</Label>
        <div className="flex gap-2">
          <Input
            id="searchAddress"
            placeholder="Search by address, city, or coordinates"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
          />
          <Button onClick={handleSearchAddress} type="button" className="whitespace-nowrap">
            Search
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={useCurrentLocation}
          type="button"
          variant="outline"
          disabled={isGettingCurrentLocation}
          className="whitespace-nowrap"
        >
          {isGettingCurrentLocation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Getting Location...
            </>
          ) : (
            <>
              📍 Use My Location
            </>
          )}
        </Button>
      </div>

      <div>
        <Label>Click on the map to select exact location</Label>
        {isLoadingLocation && (
          <div className="h-80 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Getting your location...</p>
            </div>
          </div>
        )}
        {!isLoadingLocation && (
          <div className="h-80 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {currentLocation && (
                <Marker position={currentLocation} icon={currentLocationIcon} />
              )}
              <Marker position={markerPosition} />
              <MapClicker onLocationChange={handleLocationChange} />
            </MapContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400">Latitude</Label>
          <p className="font-mono text-sm">{markerPosition[0].toFixed(6)}</p>
        </div>
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400">Longitude</Label>
          <p className="font-mono text-sm">{markerPosition[1].toFixed(6)}</p>
        </div>
      </div>

      {currentLocation && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          📍 Blue marker shows your current location. Red marker shows selected location.
        </div>
      )}
    </div>
  );
};
