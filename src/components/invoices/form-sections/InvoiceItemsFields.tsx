
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { ServiceItemType } from "@/types/service-item"

export function InvoiceItemsFields({ services, setServices }: any) {
  return (
    <ServiceSelectionField
      services={services}
      onChange={setServices}
      onServicesChange={setServices}
      allowPriceEdit={true}
      showCommission={true}
    />
  )
}
