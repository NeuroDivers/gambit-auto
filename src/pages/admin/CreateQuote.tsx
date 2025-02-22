
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft } from "lucide-react"
import { Client } from "@/components/clients/types"
import { useEffect, useRef } from "react"
import { CustomerInfoSection } from "@/components/quotes/form-sections/CustomerInfoSection"
import { VehicleInfoSection } from "@/components/quotes/form-sections/VehicleInfoSection"
import { ServicesSection } from "@/components/quotes/form-sections/ServicesSection"
import { NotesSection } from "@/components/quotes/form-sections/NotesSection"

type FormData = {
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
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

interface LocationState {
  preselectedClient?: Client;
}

export default function CreateQuote() {
  const navigate = useNavigate()
  const location = useLocation()
  const { preselectedClient } = location.state as LocationState || {}
  const initialized = useRef(false)
  
  const form = useForm<FormData>({
    defaultValues: {
      customer_first_name: "",
      customer_last_name: "",
      customer_email: "",
      customer_phone: "",
      customer_address: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear(),
      vehicle_vin: "",
      service_items: [],
      notes: ""
    }
  })

  // Set client information only once on initial mount
  useEffect(() => {
    if (!initialized.current && preselectedClient) {
      console.log("Setting preselected client data:", preselectedClient)
      form.setValue('customer_first_name', preselectedClient.first_name)
      form.setValue('customer_last_name', preselectedClient.last_name)
      form.setValue('customer_email', preselectedClient.email)
      form.setValue('customer_phone', preselectedClient.phone_number || '')
      form.setValue('customer_address', preselectedClient.address || '')
      initialized.current = true

      // Fetch default vehicle if client is preselected
      const fetchDefaultVehicle = async () => {
        const { data: vehicles, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('client_id', preselectedClient.id)
          .eq('is_primary', true)
          .maybeSingle()

        if (error) {
          console.error('Error fetching vehicle:', error)
          return
        }

        if (vehicles) {
          console.log("Setting vehicle data:", vehicles)
          form.setValue('vehicle_make', vehicles.make)
          form.setValue('vehicle_model', vehicles.model)
          form.setValue('vehicle_year', vehicles.year)
          form.setValue('vehicle_vin', vehicles.vin || '')
        }
      }

      fetchDefaultVehicle()
    }
  }, [preselectedClient, form])

  const onSubmit = async (data: FormData) => {
    try {
      // Calculate totals
      const subtotal = data.service_items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      )

      // Create quote
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          customer_first_name: data.customer_first_name,
          customer_last_name: data.customer_last_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          customer_address: data.customer_address,
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_vin: data.vehicle_vin,
          notes: data.notes,
          subtotal,
          total: subtotal,
          status: 'draft',
          client_id: preselectedClient?.id
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

      toast.success("Quote created successfully")
      navigate(`/admin/quotes/${quote?.id}`)
    } catch (error: any) {
      console.error('Error creating quote:', error)
      toast.error("Failed to create quote")
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageTitle 
          title="Create Quote"
          description="Create a new quote for a customer"
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CustomerInfoSection form={form} />
          <VehicleInfoSection form={form} />
          <ServicesSection form={form} />
          <NotesSection form={form} />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Quote
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
