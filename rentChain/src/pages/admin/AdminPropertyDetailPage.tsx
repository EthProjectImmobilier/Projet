import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PropertyService } from '@/services/property.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trash2,
  MapPin,
  Users,
  Bed,
  Bath,
  Wifi,
  Home
} from 'lucide-react';
import { formatEth, formatUsd, ethToUsd } from '@/lib/utils';
import type { Property } from '@/types/property.types';

export const AdminPropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const propertyId = id ? parseInt(id) : null;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'delete' | null;
    reason?: string;
  }>({
    open: false,
    type: null,
  });

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    if (!propertyId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await PropertyService.getById(propertyId);
      setProperty(data);
    } catch (err) {
      console.error('Failed to fetch property:', err);
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!propertyId) return;

    try {
      await PropertyService.adminApprove(propertyId);
      toast.success('Property approved successfully!');
      fetchProperty();
      setActionDialog({ open: false, type: null });
    } catch (err) {
      console.error('Failed to approve property:', err);
      toast.error('Failed to approve property');
    }
  };

  const handleReject = async (reason: string) => {
    if (!propertyId) return;

    try {
      await PropertyService.adminReject(propertyId, reason);
      toast.success('Property rejected successfully!');
      navigate('/admin/properties');
    } catch (err) {
      console.error('Failed to reject property:', err);
      toast.error('Failed to reject property');
    }
  };

  const handleDelete = async () => {
    if (!propertyId) return;

    try {
      await PropertyService.adminDelete(propertyId);
      toast.success('Property deleted successfully!');
      navigate('/admin/properties');
    } catch (err) {
      console.error('Failed to delete property:', err);
      toast.error('Failed to delete property');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'ACTIVE': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'PENDING_ADMIN': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full mb-6" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/admin/properties')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error || 'Property not found'}</p>
            <Button onClick={fetchProperty} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/properties')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{property.address.city}, {property.address.country}</span>
              </div>
              <Badge className={getStatusBadge(property.status)}>
                {property.status}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatEth(property.pricePerNight)} ETH</div>
            <div className="text-muted-foreground">≈ {formatUsd(ethToUsd(property.pricePerNight))}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Images */}
          {property.images && property.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.images.slice(0, 4).map((image) => (
                <img
                  key={image.id}
                  src={image.imageUrl}
                  alt={image.caption || property.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No images available</span>
            </div>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About this property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </CardContent>
          </Card>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{property.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Max Guests</p>
                    <p className="font-medium">{property.maxGuests}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={property.ownerProfilePicture} alt={`${property.ownerFirstName} ${property.ownerLastName}`} />
                  <AvatarFallback>
                    {property.ownerFirstName?.[0]}{property.ownerLastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{property.ownerFirstName} {property.ownerLastName}</p>
                  <p className="text-sm text-muted-foreground">Property Owner</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/users/${property.ownerId}`)}
              >
                View Owner Profile
              </Button>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {property.status === 'PENDING_ADMIN' && (
                <>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setActionDialog({ open: true, type: 'approve' })}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Property
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setActionDialog({ open: true, type: 'reject' })}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Property
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setActionDialog({ open: true, type: 'delete' })}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Property
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog
        open={actionDialog.open && actionDialog.type === 'approve'}
        onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this property? It will become visible to tenants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog
        open={actionDialog.open && actionDialog.type === 'reject'}
        onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Property</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejecting this property. The owner will see this feedback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectReason">Rejection Reason</Label>
            <Input
              id="rejectReason"
              placeholder="e.g., Property images are unclear, description is incomplete..."
              value={actionDialog.reason || ''}
              onChange={(e) => setActionDialog({ ...actionDialog, reason: e.target.value })}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => actionDialog.reason && handleReject(actionDialog.reason)}
              disabled={!actionDialog.reason}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={actionDialog.open && actionDialog.type === 'delete'}
        onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone and will permanently remove the property.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};