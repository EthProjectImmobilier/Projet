import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountryCitySelector } from './CountryCitySelector';
import { LocationPicker } from './LocationPicker';
import { PropertyService } from '@/services/property.service';
import type { Property } from '@/types/property.types';
import { useNavigate } from 'react-router-dom';
import { usdToEth, ethToUsd, formatEth, formatUsd } from '@/lib/utils';

interface PropertyFormProps {
  initialData?: Partial<Property>;
  onSubmit: (data: any) => void;
  submitButtonText?: string;
  submitButtonDisabled?: boolean;
}

interface AmenitiesInputProps {
  amenities: string[];
  onChange: (amenities: string[]) => void;
}

const AmenitiesInput: React.FC<AmenitiesInputProps> = ({ amenities, onChange }) => {
  const [input, setInput] = useState('');

  const addAmenity = () => {
    if (input.trim() && !amenities.includes(input.trim())) {
      onChange([...amenities, input.trim()]);
      setInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    onChange(amenities.filter(a => a !== amenity));
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add amenity"
          onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
        />
        <Button onClick={addAmenity} type="button">Add</Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {amenities.map((amenity, index) => (
          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeAmenity(amenity)}>
            {amenity} ×
          </Badge>
        ))}
      </div>
    </div>
  );
};

export const PropertyForm: React.FC<PropertyFormProps> = ({
  initialData,
  onSubmit,
  submitButtonText = 'Create Property',
  submitButtonDisabled = false,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: string;
    address: {
      street: string;
      city: string;
      country: string;
      zipCode: string;
      latitude: number;
      longitude: number;
    };
    pricePerNight: number;
    pricePerNightEth: number;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    minStayNights: number;
    securityDeposit: number;
    cancellationPolicyDays: number;
    instantBookable: boolean;
    ownershipDocumentUrl: string;
  }>({
    title: '',
    description: '',
    type: '',
    address: {
      street: '',
      city: '',
      country: '',
      zipCode: '',
      latitude: 0,
      longitude: 0,
    },
    pricePerNight: 0,
    pricePerNightEth: 0,
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    minStayNights: 1,
    securityDeposit: 0,
    cancellationPolicyDays: 0,
    instantBookable: false,
    ownershipDocumentUrl: '',
  });

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [ownershipDocument, setOwnershipDocument] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        type: initialData.type || '',
        address: initialData.address || {
          street: '',
          city: '',
          country: '',
          zipCode: '',
          latitude: 0,
          longitude: 0,
        },
        pricePerNight: initialData.pricePerNight || 0,
        pricePerNightEth: initialData.pricePerNightEth || 0,
        maxGuests: initialData.maxGuests || 1,
        bedrooms: initialData.bedrooms || 1,
        bathrooms: initialData.bathrooms || 1,
        amenities: initialData.amenities || [] as string[],
        minStayNights: initialData.minStayNights || 1,
        securityDeposit: initialData.securityDeposit || 0,
        cancellationPolicyDays: initialData.cancellationPolicyDays || 0,
        instantBookable: initialData.instantBookable || false,
        ownershipDocumentUrl: initialData.ownershipDocumentUrl || '',
      });
    }
  }, [initialData]);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Basic Information', key: 'basic' },
    { title: 'Address', key: 'address' },
    { title: 'Images', key: 'images' },
    { title: 'Property Details', key: 'details' },
    { title: 'Documents & Rules', key: 'documents' },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Information
        return formData.title.trim() !== '' && formData.description.trim() !== '' && formData.type.trim() !== '';
      case 1: // Address
        return formData.address.street.trim() !== '' && formData.address.city.trim() !== '' &&
               formData.address.country.trim() !== '' && formData.address.zipCode.trim() !== '' &&
               formData.address.latitude !== 0 && formData.address.longitude !== 0;
      case 2: // Images
        return uploadedImages.length > 0;
      case 3: // Property Details
        return formData.pricePerNight > 0 && formData.maxGuests > 0 && formData.bedrooms > 0 && formData.bathrooms > 0;
      case 4: // Documents & Rules
        return formData.minStayNights > 0 && formData.cancellationPolicyDays >= 0 && ownershipDocument !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Step 1: Create property with basic info (excluding images and ownership document)
      const createData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          country: formData.address.country,
          zipCode: formData.address.zipCode,
          latitude: formData.address.latitude,
          longitude: formData.address.longitude,
        },
        pricePerNight: formData.pricePerNightEth,
        maxGuests: formData.maxGuests,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        amenities: formData.amenities,
        minStayNights: formData.minStayNights,
        securityDeposit: formData.securityDeposit,
        cancellationPolicyDays: formData.cancellationPolicyDays,
        instantBookable: formData.instantBookable,
      };

      const createdProperty = await PropertyService.create(createData);
      const propertyId = createdProperty.id;

      // Step 2: Upload images in order
      if (uploadedImages.length > 0) {
        for (let i = 0; i < uploadedImages.length; i++) {
          await PropertyService.uploadImage(propertyId, uploadedImages[i]);
        }
      }

      // Step 3: Upload ownership document
      if (ownershipDocument) {
        await PropertyService.uploadOwnershipDocument(propertyId, ownershipDocument);
      }

      // Step 4: Show success message
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error creating property:', error);
      onSubmit({
        error: true,
        message: 'Failed to create property. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUsdPriceChange = (usd: number) => {
    const eth = usdToEth(usd);
    setFormData(prev => ({ ...prev, pricePerNight: usd, pricePerNightEth: eth }));
  };

  const handleEthPriceChange = (eth: number) => {
    const usd = ethToUsd(eth);
    setFormData(prev => ({ ...prev, pricePerNight: usd, pricePerNightEth: eth }));
  };

  const updateAddress = (field: string, value: string | number) => {
    if (field === 'latitude' || field === 'longitude') {
      setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: typeof value === 'string' ? parseFloat(value) : value } }));
    } else {
      setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Property Title</Label>
              <Input
                id="title"
                placeholder="e.g., Cozy Apartment in Downtown"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your property..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Property Type</Label>
              <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOUSE">House</SelectItem>
                  <SelectItem value="LOFT">Loft</SelectItem>
                  <SelectItem value="APARTMENT">Apartment</SelectItem>
                  <SelectItem value="STUDIO">Studio</SelectItem>
                  <SelectItem value="CASTLE">Castle</SelectItem>
                  <SelectItem value="CABIN">Cabin</SelectItem>
                  <SelectItem value="CONDO">Condo</SelectItem>
                  <SelectItem value="VILLA">Villa</SelectItem>
                  <SelectItem value="BUNGALOW">Bungalow</SelectItem>
                  <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 1: // Address
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                placeholder="e.g., 123 Main St"
                value={formData.address.street}
                onChange={(e) => updateAddress('street', e.target.value)}
                required
              />
            </div>

            <CountryCitySelector
              country={formData.address.country}
              city={formData.address.city}
              onCountryChange={(country) => updateAddress('country', country)}
              onCityChange={(city) => updateAddress('city', city)}
            />

            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                placeholder="e.g., 10001"
                value={formData.address.zipCode}
                onChange={(e) => updateAddress('zipCode', e.target.value)}
                required
              />
            </div>

            <LocationPicker
              latitude={formData.address.latitude}
              longitude={formData.address.longitude}
              address={`${formData.address.street}, ${formData.address.city}, ${formData.address.country}`}
              onLocationChange={(lat, lng) => {
                updateAddress('latitude', lat.toString());
                updateAddress('longitude', lng.toString());
              }}
            />
          </div>
        );
      case 2: // Images
        return (
          <div className="space-y-4">
            <div>
              <Label>Property Images</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload high-quality images of your property. The first image will be the main image.
              </p>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setUploadedImages(prev => [...prev, ...files]);
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-medium">Click to upload images</p>
                    <p className="text-sm">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                </label>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div>
                <Label>Uploaded Images ({uploadedImages.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {uploadedImages.map((file, index) => (
                    <div
                      key={index}
                      className="relative group cursor-move"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', index.toString());
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        const toIndex = index;
                        if (fromIndex !== toIndex) {
                          const newImages = [...uploadedImages];
                          const [movedImage] = newImages.splice(fromIndex, 1);
                          newImages.splice(toIndex, 0, movedImage);
                          setUploadedImages(newImages);
                        }
                      }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImages(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                      <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Drag and drop to reorder images. The first image will be the main image.
                </p>
              </div>
            )}
          </div>
        );
      case 3: // Property Details
        return (
          <div className="space-y-4">
            <div>
              <Label>Price per Night</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricePerNight" className="text-sm text-muted-foreground">USD</Label>
                  <Input
                    id="pricePerNight"
                    type="number"
                    placeholder="100"
                    value={formData.pricePerNight}
                    onChange={(e) => handleUsdPriceChange(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerNightEth" className="text-sm text-muted-foreground">ETH</Label>
                  <Input
                    id="pricePerNightEth"
                    type="number"
                    step="0.0001"
                    placeholder="0.0500"
                    value={formData.pricePerNightEth}
                    onChange={(e) => handleEthPriceChange(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatUsd(formData.pricePerNight)} ≈ {formatEth(formData.pricePerNightEth)} ETH
              </p>
            </div>
            <div>
              <Label htmlFor="maxGuests">Maximum Guests</Label>
              <Input
                id="maxGuests"
                type="number"
                placeholder="4"
                value={formData.maxGuests}
                onChange={(e) => updateFormData('maxGuests', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <Label htmlFor="bedrooms">Number of Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                placeholder="2"
                value={formData.bedrooms}
                onChange={(e) => updateFormData('bedrooms', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Number of Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                placeholder="1"
                value={formData.bathrooms}
                onChange={(e) => updateFormData('bathrooms', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <Label>Amenities</Label>
              <AmenitiesInput
                amenities={formData.amenities}
                onChange={(amenities) => updateFormData('amenities', amenities)}
              />
            </div>
          </div>
        );
      case 4: // Documents & Rules
        return (
          <div className="space-y-6">
            <div>
              <Label>Ownership Document</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload a document proving ownership of the property (deed, lease agreement, etc.)
              </p>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setOwnershipDocument(file);
                  }}
                  className="hidden"
                  id="document-upload"
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">
                      {ownershipDocument ? ownershipDocument.name : 'Click to upload document'}
                    </p>
                    <p className="text-sm">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Booking Rules</Label>
              <div>
                <Label htmlFor="minStayNights">Minimum Stay (Nights)</Label>
                <Input
                  id="minStayNights"
                  type="number"
                  placeholder="1"
                  value={formData.minStayNights}
                  onChange={(e) => updateFormData('minStayNights', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
                <Input
                  id="securityDeposit"
                  type="number"
                  placeholder="500"
                  value={formData.securityDeposit || ''}
                  onChange={(e) => updateFormData('securityDeposit', parseFloat(e.target.value) || undefined)}
                />
              </div>
              <div>
                <Label htmlFor="cancellationPolicyDays">Cancellation Policy (Days)</Label>
                <Input
                  id="cancellationPolicyDays"
                  type="number"
                  placeholder="7"
                  value={formData.cancellationPolicyDays}
                  onChange={(e) => updateFormData('cancellationPolicyDays', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="instantBookable"
                  checked={formData.instantBookable}
                  onCheckedChange={(checked: boolean) => updateFormData('instantBookable', checked)}
                />
                <Label htmlFor="instantBookable">Allow Instant Booking</Label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {submitSuccess ? (
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Property Submitted Successfully!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your property has been submitted successfully and is now under review. You will be notified once it's approved.
              </p>
            </div>

            <Button onClick={() => navigate('/my-listings')} className="w-full">
              View My Listings
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              {steps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center flex-1 relative">
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-6 left-[50%] w-[calc(100%-2rem)] h-1 bg-gray-300 dark:bg-gray-600 z-0" />
                  )}
                  
                  {/* Step Circle */}
                  <div className="relative z-10 mb-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 shadow-sm ${
                        index < currentStep
                          ? 'bg-primary text-white scale-100 shadow-md'
                          : index === currentStep
                          ? 'text-white scale-110 shadow-lg ring-4 ring-primary/30 dark:ring-primary/50'
                          : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 scale-100 shadow-sm'
                      }`}
                      style={index === currentStep ? {
                        background: 'linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary) 90%, black))',
                      } : undefined}
                    >
                      {index < currentStep ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Step Label */}
                  <div className="text-center">
                    <p className={`text-sm font-semibold transition-colors duration-300 ${
                      index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-xs mt-1 transition-colors duration-300 ${
                      index < currentStep ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      {index < currentStep ? 'Completed' : index === currentStep ? 'In Progress' : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
              <div
                className="h-1 rounded-full transition-all duration-500 shadow-lg"
                style={{ 
                  width: `${((currentStep + 1) / (steps.length)) * 100}%`,
                  background: 'linear-gradient(90deg, var(--primary), color-mix(in oklab, var(--primary) 85%, black))'
                }}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {renderStepContent()}
              </form>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={submitButtonDisabled || !validateStep(currentStep) || isSubmitting}
              >
                {isSubmitting ? 'Creating Property...' : submitButtonText}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};