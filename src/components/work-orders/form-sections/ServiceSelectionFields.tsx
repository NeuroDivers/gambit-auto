
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { ServiceItemType } from "@/types/service-item";
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField";

interface ServiceSelectionFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export function ServiceSelectionFields({ form }: ServiceSelectionFieldsProps) {
  const services = form.watch("service_items") || [];
  
  const handleServicesChange = (newServices: ServiceItemType[]) => {
    form.setValue("service_items", newServices, { shouldDirty: true });
  };
  
  return (
    <ServiceSelectionField
      services={services as ServiceItemType[]}
      onChange={handleServicesChange}
      disabled={false}
      showCommission
    />
  );
}
