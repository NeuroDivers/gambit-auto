
import { UseFormReturn } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { ServiceItemType } from "@/types/service-item"

export interface ServicesSectionProps {
  form: UseFormReturn<any>
  services?: ServiceItemType[]
  onServicesChange?: (services: ServiceItemType[]) => void
}

export function ServicesSection({ form, services, onServicesChange }: ServicesSectionProps) {
  const handleServicesChange = (updatedServices: ServiceItemType[]) => {
    form.setValue('service_items', updatedServices);
    
    if (onServicesChange) {
      onServicesChange(updatedServices);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
      </CardHeader>
      <CardContent>
        <ServiceSelectionField
          services={form.watch('service_items') || []}
          onChange={handleServicesChange}
          allowPriceEdit={true}
        />
      </CardContent>
    </Card>
  );
}
