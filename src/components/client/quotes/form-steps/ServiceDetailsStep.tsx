
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WindowTintField } from './service-details/WindowTintField';
import { PPFPackageField } from './service-details/PPFPackageField';
import { AutoDetailingField } from './service-details/AutoDetailingField';
import { ServiceImageUpload } from './service-details/ServiceImageUpload';

export function ServiceDetailsStep() {
  const form = useFormContext();
  const selectedService = form.watch('serviceType');
  const [images, setImages] = useState<string[]>([]);
  const [serviceDetails, setServiceDetails] = useState<Record<string, any>>({});
  
  // Update form values when our local state changes
  useEffect(() => {
    form.setValue('details', serviceDetails, { shouldValidate: true });
  }, [serviceDetails, form]);
  
  // Update form values when images change
  useEffect(() => {
    form.setValue('images', images, { shouldValidate: true });
  }, [images, form]);
  
  // Load initial values if they exist
  useEffect(() => {
    const existingDetails = form.getValues('details');
    if (existingDetails) {
      setServiceDetails(existingDetails);
    }
    
    const existingImages = form.getValues('images');
    if (existingImages && existingImages.length > 0) {
      setImages(existingImages);
    }
  }, [form]);
  
  const handleDetailsChange = (details: Record<string, any>) => {
    setServiceDetails(prev => ({
      ...prev,
      ...details
    }));
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    form.setValue('description', e.target.value, { shouldValidate: true });
  };
  
  const handleImageUpload = (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
  };
  
  const handleImageRemove = (imageUrl: string) => {
    setImages(prev => prev.filter(img => img !== imageUrl));
  };
  
  // Determine which service-specific form to show
  const renderServiceSpecificFields = () => {
    if (!selectedService) return null;
    
    switch (selectedService.toLowerCase()) {
      case 'window tinting':
        return (
          <WindowTintField 
            value={serviceDetails}
            onChange={handleDetailsChange}
          />
        );
      case 'paint protection film':
      case 'ppf':
        return (
          <PPFPackageField 
            value={serviceDetails}
            onChange={handleDetailsChange}
          />
        );
      case 'auto detailing':
      case 'detailing':
        return (
          <AutoDetailingField 
            value={serviceDetails}
            onChange={handleDetailsChange}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-2 block">
                Describe what you need
              </Label>
              <Textarea
                placeholder="Please provide any specific details about your request..."
                className="min-h-[120px]"
                value={form.watch('description') || ''}
                onChange={handleDescriptionChange}
              />
            </div>
            
            {renderServiceSpecificFields()}
            
            <ServiceImageUpload 
              images={images}
              onImageUpload={handleImageUpload}
              onRemove={handleImageRemove}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
