import { UseFormReturn } from "react-hook-form";
import { QuoteFormValues } from "../types";
import { ServiceItemType } from "@/types/service-item";
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField";

interface ServicesSectionProps {
  form: UseFormReturn<QuoteFormValues>;
  onServicesChange?: (services: ServiceItemType[]) => void;
}

export function ServicesSection({ form, onServicesChange }: ServicesSectionProps) {
  const { watch, setValue } = form;
  const services = watch("services") || [];

  // Update this part to match the ServiceSelectionField props properly
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="font-medium">Service Items</h3>
        <p className="text-sm text-muted-foreground">Select the services for this quote</p>
      </div>
      
      <ServiceSelectionField
        services={services}
        onChange={(updatedServices) => {
          form.setValue("services", updatedServices);
          if (onServicesChange) {
            onServicesChange(updatedServices);
          }
        }}
      />
    </div>
  );
}
