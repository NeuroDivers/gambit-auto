
import { WorkOrder as BaseWorkOrder } from './work-order';

// Export a WorkOrder type for components that expect timeframe property
export interface WorkOrder extends BaseWorkOrder {
  timeframe?: "flexible" | "asap" | "within_week" | "within_month";
}

// Re-export other commonly used types
export * from './work-order';
export * from './service-item';
