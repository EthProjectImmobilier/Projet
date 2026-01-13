// src/components/properties/ReviewList.tsx

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Review, PaginatedResponse } from '@/types/property.types';

interface ReviewListProps {
  reviews: PaginatedResponse<Review> | null;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  canModerate?: boolean;
  onDeleteReview?: (reviewId: number) => void;
}

// Helper function to calculate time ago
const getTimeAgo = (date: string): string => {
  const now = new Date();
  const createdDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  
  return createdDate.toLocaleDateString();
};

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  loading = false,
  onPageChange,
  canModerate = false,
  onDeleteReview,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.content.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No reviews yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.content.map((review: any) => (
        <Card key={review.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-3 flex-1">
                {/* User Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.userAvatarUrl} alt={review.userFullName} />
                  <AvatarFallback>{review.userFullName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>

                {/* User Info and Rating */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{review.userFullName}</span>
                    <span className="text-xs text-muted-foreground">{getTimeAgo(review.createdAt)}</span>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-xs">{review.rating}/5</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-foreground mb-4 leading-relaxed">{review.comment}</p>
            {canModerate && onDeleteReview && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteReview(review.id)}
              >
                Delete Review
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {reviews.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={reviews.first}
            onClick={() => onPageChange?.(reviews.number)}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {reviews.number + 1} of {reviews.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={reviews.last}
            onClick={() => onPageChange?.(reviews.number + 2)}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
