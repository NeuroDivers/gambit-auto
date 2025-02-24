
import { ServiceItemType as WorkOrderServiceItemType } from "../types"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { ServiceItemType as FormServiceItemType } from "@/hooks/quote-request/formSchema"

export type ServiceItemsFieldProps = {
  services: WorkOrderServiceItemType[]
  onServicesChange: (services: WorkOrderServiceItemType[]) => void
  disabled?: boolean
  showCommission?: boolean
}

export function ServiceItemsField({ services, onServicesChange, disabled, showCommission }: ServiceItemsFieldProps) {
  const handleServicesChange = (updatedServices: FormServiceItemType[]) => {
    const workOrderServices: WorkOrderServiceItemType[] = updatedServices.map(service => ({
      service_id: service.service_id,
      service_name: service.service_name,
      quantity: service.quantity,
      unit_price: service.unit_price,
      commission_rate: service.commission_rate ?? null,
      commission_type: service.commission_type ?? null
    }))
    
    console.log('Service items changed:', workOrderServices)
    onServicesChange(workOrderServices)
  }

  return (
    <div className="space-y-4">
      <ServiceSelectionField
        services={services.map(service => ({
          ...service,
          commission_rate: service.commission_rate ?? null,
          commission_type: service.commission_type ?? null
        }))}
        onServicesChange={handleServicesChange}
        disabled={disabled}
        showCommission={showCommission}
      />
    </div>
  )
}
