
import { ServiceItemForm } from "./service-selection/ServiceItemForm"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ServiceItemType } from "@/components/work-orders/types"
import { useServiceData } from "./service-selection/useServiceData"

type ServiceSelectionFieldProps = {
  services: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
  disabled?: boolean
}

export function ServiceSelectionField({ services, onServicesChange, disabled }: ServiceSelectionFieldProps) {
  const { data: availableServices = [] } = useServiceData()

  const handleRemoveService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    onServicesChange(updatedServices);
  };

  const handleUpdateService = (index: number, field: keyof ServiceItemType, value: any) => {
    const updatedServices = [...services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value
    };
    onServicesChange(updatedServices);
  };

  const handleAddService = () => {
    onServicesChange([
      ...services,
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
      <div className="flex justify-between items-center">
        <div className="font-medium">Services</div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddService}
          disabled={disabled}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-4">
          {services.map((service, index) => (
            <ServiceItemForm
              key={index}
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
