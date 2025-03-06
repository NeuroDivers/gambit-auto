
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
  const workOrderItem: ServiceItemType = {
    service_id: item.service_id,
    service_name: item.service_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    commission_rate: item.commission_rate,
    commission_type: item.commission_type === 'flat' ? 'fixed' : item.commission_type,
    description: item.description || ""
  };

  if (item.assigned_profile_id) {
    workOrderItem.assigned_profile_id = item.assigned_profile_id;
  }

  if (item.package_id) {
    workOrderItem.package_id = item.package_id;
  }

  return workOrderItem;
}

export function convertWorkOrderToSharedServiceItem(item: ServiceItemType): SharedServiceItemType {
  const sharedItem: SharedServiceItemType = {
    service_id: item.service_id,
    service_name: item.service_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    commission_rate: item.commission_rate,
    commission_type: item.commission_type === 'fixed' ? 'percentage' : item.commission_type
  };

  if (item.description) {
    sharedItem.description = item.description;
  }

  if (item.assigned_profile_id) {
    sharedItem.assigned_profile_id = item.assigned_profile_id;
  }

  if (item.package_id) {
    sharedItem.package_id = item.package_id;
  }

  if (item.is_parent) {
    sharedItem.is_parent = item.is_parent;
  }

  if (item.sub_services) {
    sharedItem.sub_services = item.sub_services.map(convertWorkOrderToSharedServiceItem);
  }

  if (item.parent_id) {
    sharedItem.parent_id = item.parent_id;
  }

  return sharedItem;
}
