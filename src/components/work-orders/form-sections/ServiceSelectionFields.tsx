
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
  
  const handleServiceChange = (newServices: ServiceItemType[]) => {
    form.setValue("service_items", newServices);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Service Selection</h3>
      <p className="text-sm text-muted-foreground">
        Select the main services first, then you can customize with sub-services
      </p>
      
      <ServiceSelectionField
        services={services as ServiceItemType[]}
        onChange={handleServiceChange}
        showCommission
      />
    </div>
  );
}
