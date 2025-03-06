
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ServiceItem } from "./ServiceItem";
import { ServiceItemType } from "@/types/service-item";

interface ServiceListProps {
  services: ServiceItemType[];
  onServicesChange: (services: ServiceItemType[]) => void;
  disabled?: boolean;
  showCommission?: boolean;
  showAssignedStaff?: boolean;
}

export default function ServiceList({
  services,
  onServicesChange,
  disabled = false,
  showCommission = false,
  showAssignedStaff = false,
}: ServiceListProps) {
  const [editingService, setEditingService] = useState<string | null>(null);

  const handleAddNewService = () => {
    const newService: ServiceItemType = {
      service_id: `temp-${Date.now()}`,
      service_name: "",
      quantity: 1,
      unit_price: 0,
      commission_rate: 0,
      commission_type: null,
      description: ""
    };
    onServicesChange([...services, newService]);
    setEditingService(newService.service_id);
  };

  const handleRemoveService = (id: string) => {
    onServicesChange(services.filter((service) => service.service_id !== id));
  };

  const handleUpdateService = (updatedService: ServiceItemType) => {
    const updatedServices = services.map((service) =>
      service.service_id === updatedService.service_id ? updatedService : service
    );
    onServicesChange(updatedServices);
    setEditingService(null);
  };

  const convertToWorkOrderItemType = (service: any): ServiceItemType => {
    return {
      ...service,
      description: service.description || ""
    };
  };

  return (
    <CardContent className="p-0 space-y-4">
      {services.length === 0 ? (
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-2">No services added yet</p>
          <Button
            onClick={handleAddNewService}
            disabled={disabled}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {services.map((service, index) => (
              <div key={service.service_id}>
                {index > 0 && <Separator className="my-4" />}
                <ServiceItem
                  service={convertToWorkOrderItemType(service)}
                  isEditing={editingService === service.service_id}
                  onEdit={() => setEditingService(service.service_id)}
                  onRemove={() => handleRemoveService(service.service_id)}
                  onUpdate={handleUpdateService}
                  onCancelEdit={() => setEditingService(null)}
                  disabled={disabled}
                  showCommission={showCommission}
                  showAssignedStaff={showAssignedStaff}
                />
              </div>
            ))}
          </div>
          <div className="pt-2">
            <Button
              onClick={handleAddNewService}
              disabled={disabled}
              variant="outline"
              size="sm"
              className="w-full bg-muted/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Service
            </Button>
          </div>
        </>
      )}
    </CardContent>
  );
}
