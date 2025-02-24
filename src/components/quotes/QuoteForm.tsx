import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft } from "lucide-react"
import { CustomerInfoSection } from "@/components/quotes/form-sections/CustomerInfoSection"
import { VehicleInfoSection } from "@/components/quotes/form-sections/VehicleInfoSection"
import { ServicesSection } from "@/components/quotes/form-sections/ServicesSection"
import { NotesSection } from "@/components/quotes/form-sections/NotesSection"
import { ServiceItemType } from "@/hooks/quote-request/formSchema"

type FormData = {
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_unit_number: string
  customer_street_address: string
  customer_city: string
  customer_state_province: string
  customer_postal_code: string
  customer_country: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  service_items: Array<{
    service_id: string
    service_name: string
    quantity: number
    unit_price: number
  }>
  notes: string
}

export function QuoteForm({ quote, onSuccess }: { quote?: Estimate; onSuccess?: () => void }) {
  const navigate = useNavigate()

  const form = useForm<FormData>({
    defaultValues: {
      customer_first_name: "",
      customer_last_name: "",
      customer_email: "",
      customer_phone: "",
      customer_unit_number: "",
      customer_street_address: "",
      customer_city: "",
      customer_state_province: "",
      customer_postal_code: "",
      customer_country: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear(),
      vehicle_vin: "",
      service_items: [],
      notes: ""
    }
  })

  const items = form.watch('service_items')

  const onSubmit = async (data: FormData) => {
    try {
      // Calculate totals
      const subtotal = data.service_items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      )

      const serviceItems: ServiceItemType[] = items.map(item => ({
        service_id: item.service_id,
        service_name: item.service_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        commission_rate: null,
        commission_type: null,
        description: item.description || ""
      }))

      // Create quote
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          customer_first_name: data.customer_first_name,
          customer_last_name: data.customer_last_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          customer_unit_number: data.customer_unit_number,
          customer_street_address: data.customer_street_address,
          customer_city: data.customer_city,
          customer_state_province: data.customer_state_province,
          customer_postal_code: data.customer_postal_code,
          customer_country: data.customer_country,
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_vin: data.vehicle_vin,
          notes: data.notes,
          subtotal,
          total: subtotal,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      // Add quote items
      if (quote) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(
            data.service_items.map(item => ({
              quote_id: quote.id,
              service_id: item.service_id,
              service_name: item.service_name,
              quantity: item.quantity,
              unit_price: item.unit_price
            }))
          )

        if (itemsError) throw itemsError
      }

      toast.success("Estimate created successfully")
      navigate(`/admin/estimates/${quote?.id}`)
    } catch (error: any) {
      console.error('Error creating estimate:', error)
      toast.error("Failed to create estimate")
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-6 p-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/estimates')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageTitle 
            title="Create Estimate"
            description="Create a new estimate for a customer"
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <CustomerInfoSection form={form} />
            <VehicleInfoSection form={form} />
            <ServicesSection form={form} />
            <NotesSection form={form} />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Create Estimate
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
