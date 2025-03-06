
import { UseFormReturn } from "react-hook-form";
import { ServiceItemType } from "@/types/service-item";
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField";

interface ServicesSectionProps {
  form: UseFormReturn<any>;
  onServicesChange?: (services: ServiceItemType[]) => void;
}

export function ServicesSection({ form, onServicesChange }: ServicesSectionProps) {
  const services = form.watch("service_items") || [];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="font-medium">Service Items</h3>
        <p className="text-sm text-muted-foreground">Select the services for this quote</p>
      </div>
      
      <ServiceSelectionField
        services={services as ServiceItemType[]}
        onChange={(updatedServices) => {
          form.setValue("service_items", updatedServices);
          if (onServicesChange) {
            onServicesChange(updatedServices);
          }
        }}
      />
    </div>
  );
}
