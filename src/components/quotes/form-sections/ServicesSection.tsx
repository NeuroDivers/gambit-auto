
import { useFormContext } from "react-hook-form"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { ServiceItemType } from "@/types/service-item"

export interface ServicesSectionProps {
  form?: any; // Add this to match the expected props
}

export function ServicesSection({ form }: ServicesSectionProps) {
  const formContext = useFormContext();
  // Use either the provided form or the context from useFormContext
  const { watch, setValue } = form || formContext;
  
  const services = watch("services") || [];
  
  const handleServicesChange = (updatedServices: ServiceItemType[]) => {
    setValue("services", updatedServices);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Services</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Select the services that will be included in this quote.
        </p>
      </div>
      
      <ServiceSelectionField
        value={services}
        onChange={handleServicesChange}
      />
    </div>
  )
}
