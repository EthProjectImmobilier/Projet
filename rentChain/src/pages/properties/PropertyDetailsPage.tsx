import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePropertyDetails } from '@/hooks/useProperty';
import { PropertyService } from '@/services/property.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PropertyImageGallery } from '@/components/properties/PropertyImageGallery';
import { ReviewList } from '@/components/properties/ReviewList';
import { ReviewForm } from '@/components/properties/ReviewForm';
import { BookingForm } from '@/components/bookings/BookingForm';
import { Calendar, Star, MapPin, Users, Bed, Bath, Wifi, Heart, Share, Shield, CheckCircle } from 'lucide-react';
import { formatUsd, formatEth, ethToUsd } from '@/lib/utils';
import { authStore } from '@/store/auth.store';
import { AiBadge } from '@/components/ai/AiBadge';

export const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const propertyId = id ? parseInt(id) : null;
  const { property, loading, error, refetch } = usePropertyDetails(propertyId);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [reviews, setReviews] = useState<any>(null);
  const { user } = authStore();
  const isTenant = user?.role === 'ROLE_TENANT';
  const navigate = useNavigate();

  // Fetch unavailable dates when property loads
  useEffect(() => {
    if (propertyId && !loading) {
      PropertyService.getUnavailableDates(propertyId)
        .then((dates) => setUnavailableDates(dates))
        .catch(() => setUnavailableDates([]));
    }
  }, [propertyId, loading]);

  // Fetch reviews when property loads
  useEffect(() => {
    if (propertyId) {
      PropertyService.getReviews(propertyId, 0, 10)
        .then((data) => setReviews(data))
        .catch(() => setReviews(null));
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="animate-pulse">
          <div className="h-96 bg-muted"></div>
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error || 'Property not found'}</p>
            <Button onClick={refetch}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageRating = reviews && reviews.content && reviews.content.length > 0
    ? reviews.content.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.content.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Images */}
      <div className="relative container mx-auto px-4 pt-6">
        <PropertyImageGallery images={property.images || []} />

        {/* Overlay Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white dark:bg-black/50 dark:hover:bg-black/70 dark:text-white">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white dark:bg-black/50 dark:hover:bg-black/70 dark:text-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{property.title}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{property.address.city}, {property.address.country}</span>
                    </div>
                    {averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{averageRating.toFixed(1)} ({reviews?.totalElements || 0} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            {/* Property Stats */}
            <div className="flex items-center flex-wrap gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{property.maxGuests} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5" />
                  <span>{property.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5" />
                  <span>{property.bathrooms} bathrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Min {property.minStayNights} nights</span>
                </div>
              </div>

            {/* Price Section */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl font-bold text-foreground mb-1">{formatEth(property.pricePerNight)} ETH</div>
                <div className="text-muted-foreground">per night</div>
                <div className="text-sm text-muted-foreground">≈ {formatUsd(ethToUsd(property.pricePerNight))}</div>
                
                {/* AI Suggested Price */}
                {property.suggestedPricePerNight && property.suggestedPricePerNight !== property.pricePerNight && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 mb-1">
                      <AiBadge size="sm" />
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">AI Suggested</span>
                    </div>
                    <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                      {formatEth(property.suggestedPricePerNight)} ETH/night
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>

            {/* Owner Information */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarImage src={property.ownerProfilePicture} alt={`${property.ownerFirstName} ${property.ownerLastName}`} />
                <AvatarFallback>
                  {property.ownerFirstName?.[0]}{property.ownerLastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Hosted by</p>
                <p className="font-medium text-lg">{property.ownerFirstName} {property.ownerLastName}</p>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-primary hover:underline"
                  onClick={() => navigate(`/users/${property.ownerId}`)}
                >
                  View Profile
                </Button>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">About this place</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{property.description}</p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">What this place offers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <Wifi className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Property Rules & Policies */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Things to know</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    House rules
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Check-in after 3:00 PM</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Checkout before 11:00 AM</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{property.maxGuests} guests maximum</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3">Cancellation policy</h3>
                  <div className="text-muted-foreground">
                    <p>Free cancellation up to {property.cancellationPolicyDays} days before check-in</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3">Safety & property</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Security deposit: ${property.securityDeposit || 0}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Verified host</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Reviews Section */}
            {reviews && reviews.content && reviews.content.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-semibold">
                    {reviews.content.length > 0 
                      ? (reviews.content.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.content.length).toFixed(1)
                      : '0'} 
                    · {reviews.totalElements} reviews
                  </span>
                </div>
                <ReviewList
                  reviews={reviews}
                  onPageChange={() => {
                    if (propertyId) {
                      PropertyService.getReviews(propertyId, 0, 10).then(setReviews);
                    }
                  }}
                />
              </div>
            )}

            {/* Review Form - Only for Tenants */}
            {isTenant && propertyId && (
              <>
                <Separator />
                <ReviewForm
                  propertyId={propertyId}
                  onReviewSubmitted={() => refetch()}
                />
              </>
            )}
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <BookingForm
              property={property}
              averageRating={averageRating}
              reviewCount={reviews?.totalElements || 0}
              unavailableDates={unavailableDates}
            />
          </div>
        </div>
      </div>
    </div>
  );
};