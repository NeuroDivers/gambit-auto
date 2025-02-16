
import { ServiceItemType } from "../types"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"

export type ServiceItemsFieldProps = {
  services: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
  disabled?: boolean
}

export function ServiceItemsField({ services, onServicesChange, disabled }: ServiceItemsFieldProps) {
  const handleServicesChange = (updatedServices: ServiceItemType[]) => {
    console.log('Service items changed:', updatedServices);
    onServicesChange(updatedServices);
  };

  return (
    <div className="space-y-4">
      <ServiceSelectionField
        services={services}
        onServicesChange={handleServicesChange}
        disabled={disabled}
      />
    </div>
  );
}
