
import { Form } from "@/components/ui/form"
import { useQuoteForm } from "./hooks/useQuoteForm"
import { Button } from "@/components/ui/button"
import { CustomerInfoFields } from "@/components/shared/form-fields/CustomerInfoFields"
import { VehicleInfoFields } from "@/components/shared/form-fields/VehicleInfoFields"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote, QuoteFormValues } from "./types"
import { useEffect } from "react"
import { useVinLookup } from "@/hooks/useVinLookup"
import { toast } from "sonner"

interface QuoteFormProps {
  quote?: Quote
  defaultValues?: QuoteFormValues
  onSuccess?: () => void
}

export function QuoteForm({ quote, defaultValues, onSuccess }: QuoteFormProps) {
  const initialValues = quote ? {
    customer_first_name: quote.customer_first_name,
    customer_last_name: quote.customer_last_name,
    customer_email: quote.customer_email,
    customer_phone: quote.customer_phone,
    customer_address: quote.customer_address || '',
    vehicle_make: quote.vehicle_make,
    vehicle_model: quote.vehicle_model,
    vehicle_year: quote.vehicle_year,
    vehicle_vin: quote.vehicle_vin,
    notes: quote.notes || '',
    status: quote.status,
    service_items: quote.quote_items?.map(item => ({
      service_id: item.service_id || '',
      service_name: item.service_name,
      description: item.description || '',
      quantity: item.quantity,
      unit_price: item.unit_price
    })) || []
  } : defaultValues

  const { form, onSubmit } = useQuoteForm({ quote, defaultValues: initialValues, onSuccess })
  const vin = form.watch('vehicle_vin')
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin)

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) form.setValue('vehicle_make', vinData.make)
      if (vinData.model) form.setValue('vehicle_model', vinData.model)
      if (vinData.year) form.setValue('vehicle_year', vinData.year)
    } else if (vinData?.error && vin?.length === 17) {
      toast.error(vinData.error)
    }
  }, [vinData, form, vin])

  const mapItemsToServiceItems = (items: any[]) => {
    return items.map(item => ({
      service_id: item.service_id || '',
      service_name: item.service_name,
      description: item.description || item.service_name,
      quantity: item.quantity,
      unit_price: item.unit_price
    }))
  }

  const mapServiceItemsToItems = (services: any[]) => {
    return services.map(service => ({
      service_id: service.service_id || '',
      service_name: service.service_name,
      description: service.description || service.service_name,
      quantity: service.quantity,
      unit_price: service.unit_price
    }))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerInfoFields form={form} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleInfoFields 
              form={form} 
              isLoadingVin={isLoadingVin}
              vinAutoFillEnabled={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceSelectionField 
              services={mapItemsToServiceItems(form.watch("service_items") || [])}
              onServicesChange={(services) => 
                form.setValue("service_items", mapServiceItemsToItems(services))
              }
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 
              (quote ? "Updating..." : "Creating...") : 
              (quote ? "Update Quote" : "Create Quote")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
