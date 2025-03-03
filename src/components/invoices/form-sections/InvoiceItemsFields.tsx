
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { ServiceItemType } from "@/types/service-item"

interface InvoiceItemsFieldsProps {
  items: ServiceItemType[];
  setItems: (items: ServiceItemType[]) => void;
  allowPriceEdit?: boolean;
  showCommission?: boolean;
}

export function InvoiceItemsFields({ 
  items, 
  setItems, 
  allowPriceEdit = true,
  showCommission = true 
}: InvoiceItemsFieldsProps) {
  return (
    <ServiceSelectionField
      services={items}
      onChange={setItems}
      allowPriceEdit={allowPriceEdit}
      showCommission={showCommission}
    />
  )
}
