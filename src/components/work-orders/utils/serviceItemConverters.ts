
import { ServiceItemType } from "@/types/service-item";
import { ServiceItemType as SharedServiceItemType } from "@/components/shared/form-fields/service-selection/types";

export function convertServiceItemForWorkOrder(item: any): ServiceItemType {
  return {
    service_id: item.service_id,
    service_name: item.service_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    commission_rate: item.commission_rate,
    commission_type: item.commission_type === 'flat' ? 'fixed' : item.commission_type,
    description: item.description || "",
    assigned_profile_id: item.assigned_profile_id
  };
}

export function convertSharedToWorkOrderServiceItem(item: SharedServiceItemType): ServiceItemType {
  return {
    ...item,
    commission_type: item.commission_type === 'flat' ? 'fixed' : item.commission_type,
    description: item.description || ""
  };
}

export function convertWorkOrderToSharedServiceItem(item: ServiceItemType): SharedServiceItemType {
  return {
    ...item,
    commission_type: item.commission_type === 'fixed' ? 'flat' : item.commission_type,
  } as SharedServiceItemType;
}
