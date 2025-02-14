
import { ServiceItemType } from "../types"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"

export type ServiceItemsFieldProps = {
  services: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
  disabled?: boolean
}

export function ServiceItemsField({ services, onServicesChange, disabled }: ServiceItemsFieldProps) {
  return (
    <div className="space-y-4">
      <ServiceSelectionField
        services={services}
        onServicesChange={onServicesChange}
        disabled={disabled}
      />
    </div>
  )
}
