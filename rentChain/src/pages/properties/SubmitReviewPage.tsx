import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePropertyDetails } from '@/hooks/useProperty';
import { PropertyService } from '@/services/property.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { ReviewData } from '@/types/property.types';

export const SubmitReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const propertyId = id ? parseInt(id) : null;
  const navigate = useNavigate();
  const { property, loading, error } = usePropertyDetails(propertyId);

  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 5,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;

    setSubmitting(true);
    try {
      await PropertyService.postReview(propertyId, reviewData);
      toast.success('Review submitted successfully!');
      navigate(`/properties/${propertyId}`);
    } catch (err) {
      console.error('Failed to submit review:', err);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    setReviewData({ ...reviewData, rating });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error || 'Property not found'}</p>
            <Button onClick={() => navigate('/properties')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/properties/${propertyId}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Property
        </Button>

        <h1 className="text-2xl font-bold">Write a Review</h1>
        <p className="text-muted-foreground">
          Share your experience at {property.title}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <Label className="text-base font-medium">Rating</Label>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {reviewData.rating} out of 5 stars
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                placeholder="Tell others about your stay. What did you like? What could be improved?"
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                rows={6}
                className="mt-1"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Minimum 10 characters
              </p>
            </div>

            {/* Property Info */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Reviewing:</h3>
              <div className="flex items-start gap-3">
                {property.images && property.images.length > 0 && (
                  <img
                    src={property.images[0].imageUrl}
                    alt={property.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h4 className="font-medium">{property.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {property.address.city}, {property.address.country}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${property.pricePerNight} per night
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || reviewData.comment.length < 10}
              className="w-full"
              size="lg"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Review Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Be honest and constructive in your feedback</p>
          <p>• Focus on your experience and the property</p>
          <p>• Avoid personal attacks or inappropriate content</p>
          <p>• Reviews help other travelers make informed decisions</p>
        </CardContent>
      </Card>
    </div>
  );
};