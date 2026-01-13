import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { formatEth, formatUsd, ethToUsd } from '@/lib/utils';
import type { OwnerProfileProperty } from '@/types/property.types';

interface OwnerPropertyCardProps {
  property: OwnerProfileProperty;
}

export const OwnerPropertyCard: React.FC<OwnerPropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/properties/${property.id}`)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{property.title}</CardTitle>
          <Badge variant={property.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {property.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground capitalize">{property.type.toLowerCase()}</p>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <span className="text-xl font-bold">{formatEth(property.pricePerNight)} ETH/night</span>
          <span className="text-sm text-muted-foreground block">≈ {formatUsd(ethToUsd(property.pricePerNight))}</span>
        </div>

        {property.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {property.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1">
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
      </CardContent>
    </Card>
  );
};