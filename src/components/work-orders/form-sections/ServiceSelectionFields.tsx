
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { ServiceItemsField } from "../form-fields/ServiceItemsField";

interface ServiceSelectionFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export function ServiceSelectionFields({ form }: ServiceSelectionFieldsProps) {
  return <ServiceItemsField form={form} />;
}
