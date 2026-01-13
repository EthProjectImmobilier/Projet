import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePropertyImages } from '@/hooks/useProperty';
import { PropertyService } from '@/services/property.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { ArrowLeft, Upload, Trash2, Edit, Image as ImageIcon, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { PropertyImage } from '@/types/property.types';

export const ManagePhotosPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const propertyId = id ? parseInt(id) : null;
  const navigate = useNavigate();
  const { images, loading, error, refetch } = usePropertyImages(propertyId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<PropertyImage | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; imageId: number | null }>({
    open: false,
    imageId: null,
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !propertyId) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await PropertyService.uploadImage(propertyId, files[i], `Property image ${i + 1}`);
      }
      refetch();
      toast.success('Images uploaded successfully!');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!propertyId) return;

    try {
      await PropertyService.deleteImage(propertyId, imageId);
      refetch();
      toast.success('Image deleted successfully!');
      setDeleteDialog({ open: false, imageId: null });
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete image. Please try again.');
    }
  };

  const handleUpdateImage = async (imageId: number, caption: string) => {
    try {
      await PropertyService.updateImage(imageId, { caption });
      refetch();
      toast.success('Image updated successfully!');
      setEditingImage(null);
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update image. Please try again.');
    }
  };

  const handleSetMainImage = async (imageId: number) => {
    if (!propertyId) return;

    try {
      await PropertyService.setMainImage(propertyId, imageId);
      refetch();
      toast.success('Main image updated successfully!');
    } catch (err) {
      console.error('Failed to set main image:', err);
      toast.error('Failed to update main image. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !propertyId) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error || 'Property not found'}</p>
            <Button onClick={() => navigate('/my-listings')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/properties/${propertyId}/edit`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Edit Property
        </Button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Manage Photos</h1>
            <p className="text-muted-foreground">
              Upload and manage photos for your property
            </p>
          </div>

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </Button>
          </div>
        </div>
      </div>

      {!images || images.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
            <p className="text-muted-foreground mb-4">
              Add some photos to showcase your property to potential guests.
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Photos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={image.imageUrl}
                    alt={image.caption || 'Property image'}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingImage(image)}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteDialog({ open: true, imageId: image.id })}
                      className="bg-red-500/90 hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {image.displayOrder === 0 && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Main
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Order: {image.displayOrder + 1}
                  </p>
                  {image.displayOrder !== 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetMainImage(image.id)}
                      className="w-full"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Set as Main
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Edit Image Dialog */}
      {editingImage && (
        <AlertDialog open={true} onOpenChange={() => setEditingImage(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Image</AlertDialogTitle>
              <AlertDialogDescription>
                Update the alt text for this image.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                defaultValue={editingImage.caption || ''}
                placeholder="Describe this image..."
                className="mt-1"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  const textarea = document.getElementById('caption') as HTMLTextAreaElement;
                  handleUpdateImage(editingImage.id, textarea.value);
                }}
              >
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, imageId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.imageId && handleDeleteImage(deleteDialog.imageId)}
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