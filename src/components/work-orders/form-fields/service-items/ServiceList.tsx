
import { ServiceItemType } from "@/types/service-item";
import { ServiceItem } from "./ServiceItem";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ServiceDropdown } from "@/components/shared/form-fields/service-selection/ServiceDropdown";

interface ServiceListProps {
  services: ServiceItemType[];
  onChange: (services: ServiceItemType[]) => void;
  allowPriceEdit?: boolean;
  showDelete?: boolean;
  showCommission?: boolean;
  showStaffAssignment?: boolean;
}

export function ServiceList({
  services,
  onChange,
  allowPriceEdit = true,
  showDelete = true,
  showCommission = false,
  showStaffAssignment = false
}: ServiceListProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  // Handle adding a new service
  const handleAddService = (serviceData: any) => {
    const newService: ServiceItemType = {
      service_id: serviceData.id,
      service_name: serviceData.name,
      quantity: 1,
      unit_price: serviceData.base_price || 0,
      commission_rate: 0,
      commission_type: null,
      description: serviceData.description || "",
    };
    
    onChange([...services, newService]);
    setIsAdding(false);
  };
  
  // Handle updating a service
  const handleUpdateService = (index: number, updatedService: ServiceItemType) => {
    const updatedServices = [...services];
    updatedServices[index] = updatedService;
    onChange(updatedServices);
  };
  
  // Handle removing a service
  const handleRemoveService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    onChange(updatedServices);
  };
  
  return (
    <div className="space-y-4">
      {services.map((service, index) => (
        <ServiceItem
          key={index}
          service={service}
          onChange={(updated) => handleUpdateService(index, updated)}
          onRemove={() => handleRemoveService(index)}
          allowPriceEdit={allowPriceEdit}
          showDelete={showDelete}
          showCommission={showCommission}
          showStaffAssignment={showStaffAssignment}
        />
      ))}
      
      {isAdding ? (
        <div className="border rounded-md p-4">
          <ServiceDropdown
            onSelect={handleAddService}
            onClose={() => setIsAdding(false)}
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      )}
    </div>
  );
}
