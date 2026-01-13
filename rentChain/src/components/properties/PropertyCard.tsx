import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatUsd, formatEth, ethToUsd } from '@/lib/utils';
import { AiBadge } from '@/components/ai/AiBadge';
import type { PropertySummary } from '@/types/property.types';

interface PropertyCardProps {
  property: PropertySummary;
  showOwnerActions?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showOwnerActions = false,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  // Get the main image (first image with displayOrder 0, or first image if no displayOrder 0)
  const mainImage = property.images?.find(img => img.displayOrder === 0) || property.images?.[0];

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow pt-0" onClick={() => navigate(`/properties/${property.id}`)}>
      <div className="relative">
        {mainImage ? (
          <img
            src={mainImage.imageUrl}
            alt={mainImage.caption || property.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite toggle
          }}
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{property.title}</CardTitle>
          {property.averageRating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{property.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{property.address.city}, {property.address.country}</p>
      </CardHeader>

      <CardContent>
        {/* Owner Information */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
          <Avatar className="w-8 h-8">
            <AvatarImage src={property.ownerProfilePicture} alt={`${property.ownerFirstName} ${property.ownerLastName}`} />
            <AvatarFallback className="text-xs">
              {property.ownerFirstName?.[0]}{property.ownerLastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">Hosted by {property.ownerFirstName} {property.ownerLastName}</p>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs text-primary hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/users/${property.ownerId}`);
              }}
            >
              View Profile
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <span className="text-xl font-bold">{formatEth(property.pricePerNight)} ETH/night</span>
            <span className="text-sm text-muted-foreground block">≈ {formatUsd(ethToUsd(property.pricePerNight))}</span>
            {property.suggestedPricePerNight && property.suggestedPricePerNight !== property.pricePerNight && (
              <div className="mt-2 pt-2 border-t">
                <div className="flex items-center gap-1 mb-1">
                  <AiBadge size="sm" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">AI Suggested</span>
                </div>
                <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                  {formatEth(property.suggestedPricePerNight)} ETH/night
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            {!property.instantBookable && (
              <Badge variant="outline">Request Required</Badge>
            )}
          </div>
        </div>

        <p className="text-sm mb-2">
          {property.bedrooms} bed • {property.bathrooms} bath • Max {property.maxGuests} guests
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {property.amenities.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{property.amenities.length - 3} more
            </Badge>
          )}
        </div>

        {showOwnerActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(property.id);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(property.id);
              }}
            >
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};