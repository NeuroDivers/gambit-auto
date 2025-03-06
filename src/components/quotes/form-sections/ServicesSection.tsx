import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"

export function ServicesSection({ services, onServicesChange }: any) {
  return (
    <ServiceSelectionField
      services={services}
      onChange={onServicesChange}
      onServicesChange={onServicesChange}
    />
  )
}
