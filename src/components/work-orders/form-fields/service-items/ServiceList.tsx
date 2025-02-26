
import React from 'react';
import { ServiceItem } from './ServiceItem';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { useServiceData } from "@/components/shared/form-fields/service-selection/useServiceData";
import { ServiceItemType } from "@/types/service-item";

interface ServiceListProps {
  workOrderServices: ServiceItemType[];
  onAddService: (service: ServiceItemType) => void;
  onRemoveService: (index: number) => void;
  onUpdateService: (index: number, service: ServiceItemType) => void;
}

export function ServiceList({ workOrderServices, onAddService, onRemoveService, onUpdateService }: ServiceListProps) {
  const { services } = useServiceData();

  const handleAddService = () => {
    const newService: ServiceItemType = {
      service_id: "",
      service_name: "",
      quantity: 1,
      unit_price: 0,
      commission_rate: 0,
      commission_type: null,
      assigned_profile_id: null
    };
    onAddService(newService);
  };

  return (
    <div className="space-y-4">
      {workOrderServices.map((service, index) => (
        <ServiceItem
          key={index}
          index={index}
          service={service}
          availableServices={services}
          onRemove={() => onRemoveService(index)}
          onChange={(updatedService) => onUpdateService(index, updatedService)}
        />
      ))}
      <Button type="button" onClick={handleAddService} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Service
      </Button>
    </div>
  );
}
