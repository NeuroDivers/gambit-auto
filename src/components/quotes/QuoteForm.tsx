
import { Form } from "@/components/ui/form"
import { useQuoteForm } from "./hooks/useQuoteForm"
import { Button } from "@/components/ui/button"
import { CustomerInfoFields } from "@/components/shared/form-fields/CustomerInfoFields"
import { VehicleInfoFields } from "@/components/shared/form-fields/VehicleInfoFields"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote } from "./types"
import { useEffect } from "react"
import { useVinLookup } from "@/hooks/useVinLookup"
import { toast } from "sonner"

interface QuoteFormProps {
  quote?: Quote
  onSuccess?: () => void
}

export function QuoteForm({ quote, onSuccess }: QuoteFormProps) {
  const { form, onSubmit } = useQuoteForm({ quote, onSuccess })
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div id="quote-form-portal-root" className="absolute top-0 left-0" />
        
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
            <ServiceSelectionField form={form} />
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
