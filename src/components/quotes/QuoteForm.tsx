import { Form } from "@/components/ui/form"
import { useQuoteForm } from "./hooks/useQuoteForm"
import { Button } from "@/components/ui/button"
import { CustomerInfoFields } from "@/components/shared/form-fields/CustomerInfoFields"
import { VehicleInfoFields } from "@/components/shared/form-fields/VehicleInfoFields"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote } from "./types"

interface QuoteFormProps {
  quote?: Quote
  onSuccess?: () => void
}

export function QuoteForm({ quote, onSuccess }: QuoteFormProps) {
  const { form, onSubmit } = useQuoteForm(onSuccess, quote)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerInfoFields form={form} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleInfoFields form={form} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
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