
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AutoDetailingField } from './service-details/AutoDetailingField';
import { PPFPackageField } from './service-details/PPFPackageField';
import { WindowTintField } from './service-details/WindowTintField';
import { ServiceImageUpload } from './service-details/ServiceImageUpload';
import { Button } from '@/components/ui/button';
import { FormStepProps } from './types';

export function ServiceDetailsStep({ form }: FormStepProps) {
  const serviceType = form.watch('service_type');
  const details = form.watch('service_details') || {};
  const images = form.watch('images') || [];

  const handleDetailsChange = (serviceDetails: Record<string, any>) => {
    form.setValue('service_details', serviceDetails);
  };

  const handleImageUpload = async (files: FileList) => {
    try {
      // Simulate image upload (in a real app, you'd upload to a server here)
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      const currentImages = form.getValues('images') || [];
      const updatedImages = [...currentImages, ...newImages];
      form.setValue('images', updatedImages);
      return newImages;
    } catch (error) {
      console.error('Error uploading images:', error);
      return [];
    }
  };

  const handleImageRemove = (imageUrl: string) => {
    const currentImages = form.getValues('images') || [];
    const updatedImages = currentImages.filter(img => img !== imageUrl);
    form.setValue('images', updatedImages);
  };

  const renderServiceDetailsForm = () => {
    // Get the current details for the selected service type
    const serviceDetails = details[serviceType] || {};
    
    const updateServiceDetails = (serviceDetails: Record<string, any>) => {
      const currentDetails = form.getValues('service_details') || {};
      form.setValue('service_details', {
        ...currentDetails,
        [serviceType]: serviceDetails
      });
    };

    switch (serviceType) {
      case 'autoDetailing':
        return (
          <AutoDetailingField
            form={form}
            serviceId={serviceType}
            value={serviceDetails}
            onChange={updateServiceDetails}
          />
        );
      case 'ppfPackage':
        return (
          <PPFPackageField
            form={form}
            serviceId={serviceType}
            value={serviceDetails}
            onChange={updateServiceDetails}
          />
        );
      case 'windowTint':
        return (
          <WindowTintField
            form={form}
            serviceId={serviceType}
            value={serviceDetails}
            onChange={updateServiceDetails}
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
          {renderServiceDetailsForm()}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Upload Images (Optional)</h3>
            <p className="text-sm text-muted-foreground">
              Upload images of your vehicle to help us understand your needs better.
            </p>
            
            <div className="mt-2">
              <input 
                type="file" 
                accept="image/*" 
                multiple
                id="image-upload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleImageUpload(e.target.files);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                Select Images
              </Button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Uploaded image ${index + 1}`}
                      className="rounded-md w-full h-24 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleImageRemove(img)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
