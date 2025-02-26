
import React from 'react';
import { ServiceItem } from './ServiceItem';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceItemType } from "@/types/service-item";

interface ServiceListProps {
  workOrderServices: ServiceItemType[];
  onAddService: (service: ServiceItemType) => void;
  onRemoveService: (index: number) => void;
  onUpdateService: (index: number, service: ServiceItemType) => void;
}

export function ServiceList({ workOrderServices, onAddService, onRemoveService, onUpdateService }: ServiceListProps) {
  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    }
  });

  const handleAddService = () => {
    const newService: ServiceItemType = {
      service_id: "",
      service_name: "",
      quantity: 1,
      unit_price: 0,
      commission_rate: 0,
      commission_type: null
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
          availableServices={servicesData || []}
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
