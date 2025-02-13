
import React from 'react';
import { ServiceItem } from './ServiceItem';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { useServiceData } from "@/components/shared/form-fields/service-selection/useServiceData";
import { ServiceItemType } from "../../types";

interface ServiceListProps {
  workOrderServices: ServiceItemType[];
  onServicesChange: (services: ServiceItemType[]) => void;
  disabled?: boolean;
}

export function ServiceList({ workOrderServices, onServicesChange, disabled }: ServiceListProps) {
  const { data: services = [] } = useServiceData();
  const form = useFieldArray({
    name: "service_items"
  });

  const handleRemoveService = (index: number) => {
    const updatedServices = [...workOrderServices];
    updatedServices.splice(index, 1);
    onServicesChange(updatedServices);
  };

  const handleAddService = () => {
    onServicesChange([
      ...workOrderServices,
      {
        service_id: "",
        service_name: "",
        quantity: 1,
        unit_price: 0
      }
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Portal container specific to this service list */}
      <div id="service-items-portal" className="fixed top-0 left-0 z-[100]" />
      
      <div className="space-y-4">
        {workOrderServices.map((service, index) => (
          <ServiceItem
            key={index}
            index={index}
            services={services}
            onRemove={handleRemoveService}
            field={{ value: service }}
            form={{
              getValues: () => workOrderServices,
              setValue: (_: string, newServices: ServiceItemType[]) => {
                onServicesChange(newServices);
              }
            }}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleAddService}
        disabled={disabled}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Service
      </Button>
    </div>
  );
}
