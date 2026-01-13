import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, Users, Bed, Bath, DollarSign, Eye } from 'lucide-react';
import { PropertyService } from '@/services/property.service';
import type { PropertySummary } from '@/types/property.types';
import { formatEth } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Fix z-index issues with Leaflet map
import './MapPage.css';

// Custom marker icons for different property types
const createCustomIcon = (price: number, type: string) => {
  const color = type === 'HOUSE' ? '#10b981' : type === 'APARTMENT' ? '#3b82f6' : '#f59e0b';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        font-size: 10px;
        font-weight: bold;
        color: white;
      ">
        ${formatEth(price)}<br/>ETH
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

// Component to fit map bounds to markers
const FitBoundsToMarkers: React.FC<{ properties: PropertySummary[] }> = ({ properties }) => {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0) {
      const validProperties = properties.filter(prop =>
        prop.address?.latitude != null &&
        prop.address?.longitude != null &&
        !isNaN(prop.address.latitude) &&
        !isNaN(prop.address.longitude)
      );

      if (validProperties.length > 0) {
        const bounds = L.latLngBounds(
          validProperties.map(prop => [prop.address.latitude, prop.address.longitude])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [properties, map]);

  return null;
};

export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertySummary | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all active properties for the map
      const response = await PropertyService.list(0, 1000); // Get up to 1000 properties
      // Filter only active properties with valid coordinates
      const activeProperties = response.content.filter(prop =>
        prop.status === 'ACTIVE' &&
        prop.address?.latitude != null &&
        prop.address?.longitude != null &&
        !isNaN(prop.address.latitude) &&
        !isNaN(prop.address.longitude) &&
        prop.address.latitude >= -90 && prop.address.latitude <= 90 &&
        prop.address.longitude >= -180 && prop.address.longitude <= 180
      );
      console.log(`Map: Found ${response.content.length} total properties, ${activeProperties.length} with valid coordinates`);
      setProperties(activeProperties);
    } catch (err) {
      console.error('Failed to fetch properties for map:', err);
      setError('Failed to load properties on map');
    } finally {
      setLoading(false);
    }
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'HOUSE': return 'bg-emerald-500';
      case 'APARTMENT': return 'bg-blue-500';
      case 'CONDO': return 'bg-amber-500';
      case 'VILLA': return 'bg-purple-500';
      case 'CABIN': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPropertyTypeDisplay = (type: string) => {
    switch (type.toUpperCase()) {
      case 'HOUSE': return 'House';
      case 'APARTMENT': return 'Apartment';
      case 'CONDO': return 'Condo';
      case 'VILLA': return 'Villa';
      case 'CABIN': return 'Cabin';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Property Map</h1>
          <p className="text-muted-foreground">Discover properties around the world</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Skeleton className="h-8 w-48 mx-auto mb-4" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Property Map</h1>
          <p className="text-muted-foreground">Discover properties around the world</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchProperties}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Property Map</h1>
            <p className="text-muted-foreground">
              Discover {properties.length} properties around the world
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/properties')}>
            View as List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px] w-full">
                {properties.length === 0 ? (
                  <div className="h-full flex items-center justify-center bg-muted/20">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
                      <p className="text-muted-foreground mb-4">
                        There are no properties with valid location data to display on the map.
                      </p>
                      <Button onClick={() => navigate('/properties')}>
                        Browse Properties
                      </Button>
                    </div>
                  </div>
                ) : (
                  <MapContainer
                    center={[20, 0]} // Default center
                    zoom={2}
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                    className="rounded-lg leaflet-container-custom"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FitBoundsToMarkers properties={properties} />
                    {properties
                      .filter(prop =>
                        prop.address?.latitude != null &&
                        prop.address?.longitude != null &&
                        !isNaN(prop.address.latitude) &&
                        !isNaN(prop.address.longitude)
                      )
                      .map((property) => (
                      <Marker
                        key={property.id}
                        position={[property.address.latitude, property.address.longitude]}
                        icon={createCustomIcon(property.pricePerNight, property.type)}
                        eventHandlers={{
                          click: () => setSelectedProperty(property),
                        }}
                      >
                      <Popup>
                        <div className="min-w-[250px]">
                          <div className="flex gap-3 mb-3">
                            <img
                              src={property.images[0]?.imageUrl || '/placeholder-property.jpg'}
                              alt={property.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm line-clamp-2">{property.title}</h3>
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {property.address.city}, {property.address.country}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-bold">{formatEth(property.pricePerNight)} ETH</span>
                              <span className="text-sm text-muted-foreground">/night</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {getPropertyTypeDisplay(property.type)}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{property.maxGuests}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Bed className="w-3 h-3" />
                              <span>{property.bedrooms}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Bath className="w-3 h-3" />
                              <span>{property.bathrooms}</span>
                            </div>
                          </div>

                          {property.averageRating && (
                            <div className="flex items-center gap-1 mb-3">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{property.averageRating.toFixed(1)}</span>
                            </div>
                          )}

                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => navigate(`/properties/${property.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedProperty ? (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <img
                      src={selectedProperty.images[0]?.imageUrl || '/placeholder-property.jpg'}
                      alt={selectedProperty.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-lg line-clamp-2">{selectedProperty.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {selectedProperty.address.city}, {selectedProperty.address.country}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold text-lg">{formatEth(selectedProperty.pricePerNight)} ETH</span>
                      <span className="text-sm text-muted-foreground">/night</span>
                    </div>
                    <Badge className={getPropertyTypeColor(selectedProperty.type)}>
                      {getPropertyTypeDisplay(selectedProperty.type)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="w-4 h-4 mb-1" />
                      <span className="text-sm font-medium">{selectedProperty.maxGuests}</span>
                      <span className="text-xs text-muted-foreground">Guests</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Bed className="w-4 h-4 mb-1" />
                      <span className="text-sm font-medium">{selectedProperty.bedrooms}</span>
                      <span className="text-xs text-muted-foreground">Bedrooms</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Bath className="w-4 h-4 mb-1" />
                      <span className="text-sm font-medium">{selectedProperty.bathrooms}</span>
                      <span className="text-xs text-muted-foreground">Bathrooms</span>
                    </div>
                  </div>

                  {selectedProperty.averageRating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{selectedProperty.averageRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">rating</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={selectedProperty.ownerProfilePicture} />
                      <AvatarFallback className="text-xs">
                        {selectedProperty.ownerFirstName?.[0]}{selectedProperty.ownerLastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      Hosted by {selectedProperty.ownerFirstName}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => navigate(`/properties/${selectedProperty.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Property
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Select a Property</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any property marker on the map to view details here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};