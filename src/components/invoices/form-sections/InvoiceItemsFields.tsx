
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { ServiceItemType } from "@/types/service-item"
import { InvoiceItem } from "@/components/invoices/types"

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
  showCommission = true 
}: InvoiceItemsFieldsProps) {
  // Map InvoiceItem[] to ServiceItemType[] if needed
  const mappedItems = items.map(item => {
    const serviceItem: ServiceItemType = {
      service_id: item.service_id,
      service_name: item.service_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      description: item.description || "",
      commission_rate: (item as any).commission_rate ?? null,
      commission_type: (item as any).commission_type ?? null,
      package_id: (item as any).package_id || undefined
    };
    return serviceItem;
  });

  // Handle the conversion back
  const handleItemsChange = (updatedItems: ServiceItemType[]) => {
    const convertedItems = updatedItems.map(item => {
      const invoiceItem: InvoiceItem = {
        service_id: item.service_id,
        service_name: item.service_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        description: item.description || "",
        commission_rate: item.commission_rate,
        commission_type: item.commission_type,
        package_id: item.package_id
      };
      
      return invoiceItem;
    });
    
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
