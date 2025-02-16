
import { ServiceItemType } from "@/components/work-orders/types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useServiceData } from "./service-selection/useServiceData"
import { ServiceItem } from "./service-selection/ServiceItem"

type ServiceSelectionFieldProps = {
  services: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
  disabled?: boolean
}

export function ServiceSelectionField({ services = [], onServicesChange, disabled }: ServiceSelectionFieldProps) {
  const { data: availableServices = [], isLoading } = useServiceData();

  const handleRemoveService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    onServicesChange(updatedServices);
  };

  const handleUpdateService = (index: number, updates: Partial<ServiceItemType>) => {
    const updatedServices = [...services];
    updatedServices[index] = {
      ...updatedServices[index],
      ...updates,
      id: updatedServices[index].id || crypto.randomUUID()
    };
    onServicesChange(updatedServices);
  };

  const handleAddService = () => {
    const newService: ServiceItemType = {
      service_id: "",
      service_name: "",
      quantity: 1,
      unit_price: 0,
      id: crypto.randomUUID()
    };
    onServicesChange([...services, newService]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="font-medium">Services</div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddService}
          disabled={disabled || isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-4">
          {services.map((service, index) => (
            <ServiceItem
              key={service.id || index}
              index={index}
              item={service}
              services={availableServices}
              onUpdate={handleUpdateService}
              onRemove={() => handleRemoveService(index)}
            />
          ))}
          {services.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No services added
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
