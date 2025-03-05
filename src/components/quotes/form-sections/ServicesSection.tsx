
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { ServiceItemType } from "@/types/service-item"

interface ServicesSectionProps {
  services: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
}

export function ServicesSection({ services, onServicesChange }: ServicesSectionProps) {
  return (
    <ServiceSelectionField
      services={services}
      onChange={onServicesChange}
    />
  )
}
