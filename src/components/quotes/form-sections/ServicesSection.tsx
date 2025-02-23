
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { UseFormReturn } from "react-hook-form"

interface ServicesSectionProps {
  form: UseFormReturn<any>
}

export function ServicesSection({ form }: ServicesSectionProps) {
  return (
    <Card className="sm:p-4 p-0 border-0 sm:border">
      <CardHeader>
        <CardTitle>Services</CardTitle>
      </CardHeader>
      <CardContent>
        <ServiceSelectionField
          services={form.watch('service_items')}
          onServicesChange={(services) => form.setValue('service_items', services)}
        />
      </CardContent>
    </Card>
  )
}
