import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, AlertCircle, MapPin, Users, DoorOpen, Bath } from 'lucide-react';
import AiBadge from './AiBadge';
import type { PropertyRecommendation } from '@/services/aiService';

interface RecommendedPropertiesProps {
  properties: PropertyRecommendation[];
  loading?: boolean;
  error?: boolean;
  onPropertySelect?: (propertyId: number | string) => void;
}

/**
 * RecommendedProperties: Displays AI-recommended property cards
 * Shows in a carousel/grid format with full property details
 */
export const RecommendedProperties = ({
  properties = [],
  loading = false,
  error = false,
  onPropertySelect,
}: RecommendedPropertiesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3;
  const maxIndex = Math.max(0, properties.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + 1));
  };

  if (error || !properties.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>AI Recommendations</CardTitle>
            <AiBadge size="sm" />
          </div>
          <CardDescription>
            Properties selected for you based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                {error
                  ? 'AI insights unavailable'
                  : 'No recommendations available right now'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visibleProperties = properties.slice(
    currentIndex,
    currentIndex + itemsPerView
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>AI Recommendations</CardTitle>
            <AiBadge size="sm" />
          </div>
          <span className="text-xs text-muted-foreground">
            {properties.length} properties found
          </span>
        </div>
        <CardDescription>
          Properties selected for you based on your budget
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48 mb-2" />
                <div className="bg-muted h-4 rounded mb-2" />
                <div className="bg-muted h-3 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visibleProperties.map((property) => {
                // Get first image or use placeholder
                const firstImage = property.images && property.images.length > 0 
                  ? property.images[0].imageUrl 
                  : null;

                return (
                  <div
                    key={property.id}
                    className="group rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative bg-muted h-40 overflow-hidden">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                      {/* Property Type Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {property.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-3">
                      {/* Title */}
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-2">
                          {property.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {property.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline justify-between py-2 border-y">
                        <span className="text-lg font-bold text-primary">
                          ${property.pricePerNight?.toFixed(2) || '0.00'}
                        </span>
                        <span className="text-xs text-muted-foreground">/night</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{property.address.city}, {property.address.country}</span>
                      </div>

                      {/* Property Details */}
                      <div className="flex gap-3 text-xs">
                        {property.bedrooms !== undefined && (
                          <div className="flex items-center gap-1">
                            <DoorOpen className="h-3 w-3 text-muted-foreground" />
                            <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {property.bathrooms !== undefined && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-3 w-3 text-muted-foreground" />
                            <span>{property.bathrooms} bath</span>
                          </div>
                        )}
                        {property.maxGuests !== undefined && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{property.maxGuests} guest{property.maxGuests !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>

                      {/* Amenities */}
                      {property.amenities && property.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {property.amenities.slice(0, 3).map((amenity, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs py-0">
                              {amenity}
                            </Badge>
                          ))}
                          {property.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs py-0">
                              +{property.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Owner */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        {property.ownerProfilePicture && (
                          <img
                            src={property.ownerProfilePicture}
                            alt={property.ownerFirstName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {property.ownerFirstName} {property.ownerLastName}
                          </p>
                        </div>
                        {property.averageRating !== null && property.averageRating !== undefined && (
                          <span className="text-xs font-semibold">
                            ⭐ {property.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      {/* View Details Button */}
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => onPropertySelect?.(property.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {properties.length > itemsPerView && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1}–
                  {Math.min(currentIndex + itemsPerView, properties.length)} of{' '}
                  {properties.length}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentIndex >= maxIndex}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedProperties;
