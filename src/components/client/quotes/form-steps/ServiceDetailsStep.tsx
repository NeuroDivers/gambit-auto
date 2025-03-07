
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutoDetailingField } from './service-details/AutoDetailingField';
import { PPFPackageField } from './service-details/PPFPackageField';
import { WindowTintField } from './service-details/WindowTintField';
import { ServiceImageUpload } from './service-details/ServiceImageUpload';
import { ServiceItemType } from '@/types/service-item';

interface ServiceDetailsStepProps {
  form: any;
  services: ServiceItemType[];
  serviceId: string;
  onImageUpload: (file: File) => Promise<string>;
  onImageRemove: (url: string) => void;
}

export function ServiceDetailsStep({
  form,
  services,
  serviceId,
  onImageUpload,
  onImageRemove
}: ServiceDetailsStepProps) {
  // Find the current service being configured
  const currentService = services.find(s => s.service_id === serviceId);
  
  if (!currentService) {
    return <div>Service not found</div>;
  }

  const serviceType = getServiceType(currentService.service_name);
  
  // Get the current service details from the form
  const serviceDetails = form.watch('service_details') || {};
  const currentServiceDetails = serviceDetails[serviceId] || {};
  
  // Get the image list for this service
  const imageList = form.watch('images') || [];
  
  // Handler for updating service-specific details
  const updateServiceDetails = (details: Record<string, any>) => {
    const updatedDetails = {
      ...serviceDetails,
      [serviceId]: {
        ...currentServiceDetails,
        ...details
      }
    };
    
    form.setValue('service_details', updatedDetails);
  };

  // Handler for image upload completion
  const handleImageUploaded = (imageUrl: string) => {
    const currentImages = form.watch('images') || [];
    form.setValue('images', [...currentImages, imageUrl]);
  };

  // Handler to remove an image
  const handleImageRemove = (imageUrl: string) => {
    const currentImages = form.watch('images') || [];
    form.setValue('images', currentImages.filter(url => url !== imageUrl));
    onImageRemove(imageUrl);
  };

  // Convert File to URL for the image uploader
  const handleUpload = async (file: File) => {
    try {
      const imageUrl = await onImageUpload(file);
      handleImageUploaded(imageUrl);
      return imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">
          Service Details: {currentService.service_name}
        </h2>
        <p className="text-muted-foreground">
          Please provide additional details about this service
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              {serviceType === 'detailing' && (
                <AutoDetailingField 
                  value={currentServiceDetails}
                  onChange={updateServiceDetails}
                />
              )}
              
              {serviceType === 'ppf' && (
                <PPFPackageField
                  value={currentServiceDetails}
                  onChange={updateServiceDetails}
                />
              )}
              
              {serviceType === 'tint' && (
                <WindowTintField
                  value={currentServiceDetails}
                  onChange={updateServiceDetails}
                />
              )}
              
              {serviceType === 'other' && (
                <div className="py-4">
                  <p className="text-muted-foreground">
                    No additional details are required for this service.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="photos">
              <ServiceImageUpload
                images={imageList}
                onUpload={handleUpload}
                onRemove={handleImageRemove}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to determine service type from service name
function getServiceType(serviceName: string): 'detailing' | 'ppf' | 'tint' | 'other' {
  const name = serviceName.toLowerCase();
  
  if (name.includes('detail') || name.includes('wash') || name.includes('polish')) {
    return 'detailing';
  }
  
  if (name.includes('ppf') || name.includes('protection film')) {
    return 'ppf';
  }
  
  if (name.includes('tint') || name.includes('window')) {
    return 'tint';
  }
  
  return 'other';
}
