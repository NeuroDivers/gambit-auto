
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ServiceDropdown } from './ServiceDropdown';
import { useServiceData } from './useServiceData';
import { ServiceItem } from './ServiceItem';

export interface ServiceSelectionFieldProps {
  name?: string;
  label?: string;
  description?: string;
}

export function ServiceSelectionField({
  name = 'services',
  label = 'Services',
  description = 'Select services for this work order',
}: ServiceSelectionFieldProps) {
  const { control, watch, setValue } = useFormContext();
  const services = watch(name) || [];
  const { serviceTypes, isLoading } = useServiceData();

  const handleAddService = (selectedService: any) => {
    if (!selectedService) return;
    
    const newService = {
      service_id: selectedService.id,
      service_name: selectedService.name,
      description: selectedService.description || '',
      quantity: 1,
      unit_price: selectedService.price || 0,
      commission_rate: selectedService.commission_rate || 0,
      commission_type: selectedService.commission_type || 'percentage',
    };
    
    setValue(name, [...services, newService]);
  };

  const handleRemoveService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setValue(name, updatedServices);
  };

  const handleUpdateService = (index: number, updatedService: any) => {
    const updatedServices = [...services];
    updatedServices[index] = updatedService;
    setValue(name, updatedServices);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">{label}</h3>
        <ServiceDropdown 
          services={serviceTypes} 
          onSelect={handleAddService}
          isLoading={isLoading}
        />
      </div>
      
      {services.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-md">
          <p className="text-sm text-gray-500">{description}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => {}}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((service: any, index: number) => (
            <ServiceItem
              key={index}
              service={service}
              onUpdate={(updatedService) => handleUpdateService(index, updatedService)}
              onRemove={() => handleRemoveService(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
