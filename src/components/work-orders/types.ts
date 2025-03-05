
import { WorkOrder as BaseWorkOrder, WorkOrderFormValues as BaseWorkOrderFormValues, WorkOrderFormProps as BaseWorkOrderFormProps, CustomerType as BaseCustomerType } from "@/types/work-order";

// Use the base WorkOrder type
export type WorkOrder = BaseWorkOrder;

// Use the base WorkOrderFormValues type
export type WorkOrderFormValues = BaseWorkOrderFormValues;

// Use the base WorkOrderFormProps type
export type WorkOrderFormProps = BaseWorkOrderFormProps;

// Use the base CustomerType
export type CustomerType = BaseCustomerType;

// Define the WorkOrderStatusSelectProps interface for the status select component
export interface WorkOrderStatusSelectProps {
  status: string;
  quoteId: string;
}
