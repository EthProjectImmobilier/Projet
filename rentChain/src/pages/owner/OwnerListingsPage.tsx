import React, { useState } from 'react';
import { useMyProperties } from '@/hooks/useProperty';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { PropertyService } from '@/services/property.service';

export const OwnerListingsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const { data, loading, error, refetch } = useMyProperties(page, 12);
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; propertyId: number | null }>({
    open: false,
    propertyId: null,
  });

  const handleEdit = (propertyId: number) => {
    navigate(`/properties/${propertyId}/edit`);
  };

  const handleDelete = async (propertyId: number) => {
    try {
      await PropertyService.delete(propertyId);
      refetch();
      setDeleteDialog({ open: false, propertyId: null });
    } catch (err) {
      console.error('Failed to delete property:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Listings</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">My Listings</h1>
        <p className="text-destructive">{error}</p>
        <Button onClick={refetch} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Button onClick={() => navigate('/owner/properties/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Property
        </Button>
      </div>

      {!data || data.content.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No listings yet</h2>
          <p className="text-muted-foreground mb-4">Start by creating your first property listing.</p>
          <Button onClick={() => navigate('/owner/properties/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Listing
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-2">
              Active
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {data.content.filter(p => p.status === 'ACTIVE').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                {data.content.filter(p => p.status === 'PENDING_ADMIN').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Rejected
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {data.content.filter(p => p.status === 'REJECTED').length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Active Properties Tab */}
          <TabsContent value="active" className="mt-6">
            {data.content.filter(p => p.status === 'ACTIVE').length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No active properties</h3>
                <p className="text-muted-foreground mb-4">Your approved properties will appear here.</p>
                <Button onClick={() => navigate('/owner/properties/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.content
                  .filter(p => p.status === 'ACTIVE')
                  .map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      showOwnerActions={true}
                      onEdit={handleEdit}
                      onDelete={(id) => setDeleteDialog({ open: true, propertyId: id })}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Pending Properties Tab */}
          <TabsContent value="pending" className="mt-6">
            {data.content.filter(p => p.status === 'PENDING_ADMIN').length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No pending properties</h3>
                <p className="text-muted-foreground mb-4">Properties awaiting admin approval will appear here.</p>
              </div>
            ) : (
              <>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-orange-800">Under Review</h3>
                  </div>
                  <p className="text-sm text-orange-800">
                    Your properties are under admin review. Once approved, they will appear in your active listings and be available for booking.
                    You cannot edit properties while they are pending approval.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.content
                    .filter(p => p.status === 'PENDING_ADMIN')
                    .map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        showOwnerActions={false}
                      />
                    ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Rejected Properties Tab */}
          <TabsContent value="rejected" className="mt-6">
            {data.content.filter(p => p.status === 'REJECTED').length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No rejected properties</h3>
                <p className="text-muted-foreground mb-4">Properties that were rejected will appear here.</p>
              </div>
            ) : (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-red-800">Rejected Properties</h3>
                  </div>
                  <p className="text-sm text-red-800">
                    These properties were rejected. Please review the feedback and create a new property or contact support for more information.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.content
                    .filter(p => p.status === 'REJECTED')
                    .map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        showOwnerActions={false}
                      />
                    ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={data.first}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {data.number + 1} of {data.totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={data.last}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, propertyId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.propertyId && handleDelete(deleteDialog.propertyId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};