import { ServiceItemType } from "../types"
import { ServiceList } from "./service-items/ServiceList"

export type ServiceItemsFieldProps = {
  services: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
  disabled?: boolean
}

export function ServiceItemsField({ services, onServicesChange, disabled }: ServiceItemsFieldProps) {
  return (
    <div className="space-y-4">
      <ServiceList
        workOrderServices={services}
        onServicesChange={onServicesChange}
        disabled={disabled}
      />
    </div>
  )
}