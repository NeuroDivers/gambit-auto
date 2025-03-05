
import { ServiceItemType as WorkOrderServiceItemType } from '@/types/service-item';
import { ServiceItemType as SharedServiceItemType } from '@/components/shared/form-fields/service-selection/types';

// Convert from work order service item to shared component service item
export function convertWorkOrderToSharedServiceItem(item: WorkOrderServiceItemType): SharedServiceItemType {
  return {
    ...item,
    commission_type: item.commission_type === 'fixed' ? 'flat' : item.commission_type,
    description: item.description || '',
  };
}

// Convert from shared component service item to work order service item
export function convertServiceItemForWorkOrder(item: SharedServiceItemType): WorkOrderServiceItemType {
  return {
    ...item,
    commission_type: item.commission_type === 'flat' ? 'flat' : item.commission_type,
    description: item.description || '',
  };
}

// Convert shared service items array to work order service items array
export function convertSharedToWorkOrderServiceItems(items: SharedServiceItemType[]): WorkOrderServiceItemType[] {
  return items.map(item => convertServiceItemForWorkOrder(item));
}

// Convert work order service items array to shared service items array
export function convertWorkOrderToSharedServiceItems(items: WorkOrderServiceItemType[]): SharedServiceItemType[] {
  return items.map(item => convertWorkOrderToSharedServiceItem(item));
}
