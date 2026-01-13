import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePropertyDetails } from '@/hooks/useProperty';
import { PropertyService } from '@/services/property.service';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const EditPropertyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const propertyId = id ? parseInt(id) : null;
  const navigate = useNavigate();
  const { property, loading, error } = usePropertyDetails(propertyId);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: any) => {
    if (!propertyId) return;

    setSaving(true);
    try {
      await PropertyService.update(propertyId, data);
      toast.success('Property updated successfully!');
      navigate('/my-listings');
    } catch (err) {
      console.error('Failed to update property:', err);
      toast.error('Failed to update property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error || 'Property not found'}</p>
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
          onClick={() => navigate('/my-listings')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Listings
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Property</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyForm
              initialData={property}
              onSubmit={handleSubmit}
              submitButtonText={saving ? 'Saving...' : 'Update Property'}
              submitButtonDisabled={saving}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};