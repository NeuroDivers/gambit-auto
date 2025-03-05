
import ServiceSelectionField from "@/components/shared/form-fields/ServiceSelectionField"
import { ServiceItemType } from "@/types/service-item"
import { InvoiceItem } from "@/components/invoices/types"
import { 
  convertWorkOrderToSharedServiceItem, 
  convertSharedToWorkOrderServiceItems 
} from "@/components/work-orders/utils/serviceItemConverters"

interface InvoiceItemsFieldsProps {
  items: InvoiceItem[] | ServiceItemType[];
  setItems: (items: InvoiceItem[] | ServiceItemType[]) => void;
  allowPriceEdit?: boolean;
  showCommission?: boolean;
}

export function InvoiceItemsFields({ 
  items, 
  setItems, 
  allowPriceEdit = true,
  showCommission = false 
}: InvoiceItemsFieldsProps) {
  // Map items to ensure they have all required properties and correct types
  const mappedItems = items.map(item => {
    // Convert to shared component's ServiceItemType format
    return convertWorkOrderToSharedServiceItem({
      service_id: item.service_id,
      service_name: item.service_name,
      quantity: item.quantity,
      unit_price: typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price,
      description: item.description || "",
      commission_rate: (item as any).commission_rate ?? 0,
      commission_type: (item as any).commission_type ?? null,
      package_id: (item as any).package_id || null
    });
  });

  // Handle the conversion back
  const handleItemsChange = (updatedItems: any[]) => {
    // Convert back from shared component's ServiceItemType format
    const convertedItems = convertSharedToWorkOrderServiceItems(updatedItems);
    
    setItems(convertedItems);
  };

  return (
    <ServiceSelectionField
      services={mappedItems}
      onChange={handleItemsChange}
      allowPriceEdit={allowPriceEdit}
      showCommission={showCommission}
    />
  )
}
