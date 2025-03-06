
import { ServiceItemProps } from "@/components/shared/form-fields/service-selection/types";
import { ServiceItemForm } from "@/components/shared/form-fields/service-selection/ServiceItemForm";

export function ServiceItem({
  service,
  availableServices,
  onRemove,
  onChange
}: ServiceItemProps) {
  const servicesByType = {
    "available": availableServices
  };

  return (
    <ServiceItemForm
      service={service}
      onRemove={onRemove}
      onChange={onChange}
      services={servicesByType}
      showCommission
    />
  );
}
