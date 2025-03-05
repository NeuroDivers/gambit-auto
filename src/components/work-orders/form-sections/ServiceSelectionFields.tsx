
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { ServiceItemType } from "@/types/service-item";
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField";

interface ServiceSelectionFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export function ServiceSelectionFields({ form }: ServiceSelectionFieldsProps) {
  // Get services from form with a fallback to empty array to prevent undefined
  const services = form.watch("service_items") || [];
  
  const handleServicesChange = (newServices: ServiceItemType[]) => {
    form.setValue("service_items", newServices, { shouldDirty: true });
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Services</h3>
      <ServiceSelectionField
        services={services}
        onChange={handleServicesChange}
        disabled={false}
        showCommission
      />
    </div>
  );
}
