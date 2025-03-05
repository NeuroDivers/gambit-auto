
import { ServiceItemType } from "@/components/shared/form-fields/service-selection/types";

// Convert from work order service item to shared service item format
export function convertWorkOrderToSharedServiceItem(workOrderService: any): ServiceItemType {
  return {
    service_id: workOrderService.service_id,
    service_name: workOrderService.service_name,
    quantity: workOrderService.quantity || 1,
    unit_price: workOrderService.unit_price || 0,
    commission_rate: workOrderService.commission_rate || 0,
    commission_type: workOrderService.commission_type === 'flat' ? 'flat' : 'percentage',
    description: workOrderService.description || "",
    package_id: workOrderService.package_id || null,
    assigned_profile_id: workOrderService.assigned_profile_id || null,
    parent_id: workOrderService.main_service_id || null,
    assigned_profiles: workOrderService.assigned_profiles || []
  };
}

// Convert from shared service item format back to work order format
export function convertSharedToWorkOrderServiceItems(sharedServices: ServiceItemType[]): any[] {
  return sharedServices.map(service => ({
    service_id: service.service_id,
    service_name: service.service_name,
    quantity: service.quantity || 1,
    unit_price: service.unit_price || 0,
    commission_rate: service.commission_rate || 0,
    commission_type: service.commission_type || 'percentage',
    description: service.description || "",
    package_id: service.package_id || null,
    assigned_profile_id: service.assigned_profile_id || null,
    main_service_id: service.parent_id || null,
    assigned_profiles: service.assigned_profiles || []
  }));
}
