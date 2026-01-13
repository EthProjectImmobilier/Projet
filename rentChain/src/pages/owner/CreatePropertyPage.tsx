import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { toast } from 'sonner';

export const CreatePropertyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (result: any) => {
    if (result.error) {
      toast.error(result.message || 'Failed to create property. Please try again.');
    } else if (result.success) {
      toast.success(result.message || 'Property created successfully!');
      navigate('/owner/properties');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Property</h1>
      <PropertyForm onSubmit={handleSubmit} />
    </div>
  );
};