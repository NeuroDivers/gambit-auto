
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { ServiceItemsField } from "../form-fields/ServiceItemsField";

interface ServiceSelectionFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export function ServiceSelectionFields({ form }: ServiceSelectionFieldsProps) {
  const { control, watch } = form;
  const services = watch("service_items") || [];
  
  return (
    <ServiceItemsField
      services={services}
      onChange={(newServices) => form.setValue("service_items", newServices)}
      disabled={false}
    />
  );
}
