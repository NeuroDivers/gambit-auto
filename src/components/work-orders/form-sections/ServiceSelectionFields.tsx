
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { ServiceItemType } from "@/types/service-item";
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField";

interface ServiceSelectionFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export function ServiceSelectionFields({ form }: ServiceSelectionFieldsProps) {
  const { control, watch } = form;
  const services = watch("service_items") || [];
  
  return (
    <ServiceSelectionField
      services={services as ServiceItemType[]}
      onChange={(newServices) => form.setValue("service_items", newServices)}
      showCommission
    />
  );
}
