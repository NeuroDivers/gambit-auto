
import { useEffect } from "react"
import { EditInvoiceForm } from "@/components/invoices/sections/EditInvoiceForm"
import { PageTitle } from "@/components/shared/PageTitle"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { InvoiceFormValues } from "@/components/invoices/types"
import { Client } from "@/components/clients/types"

interface LocationState {
  preselectedClient?: Client;
}

export default function CreateInvoice() {
  const navigate = useNavigate()
  const location = useLocation()
  const { preselectedClient } = location.state as LocationState || {}

  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      status: 'draft',
      customer_first_name: preselectedClient?.first_name || '',
      customer_last_name: preselectedClient?.last_name || '',
      customer_email: preselectedClient?.email || '',
      customer_phone: preselectedClient?.phone_number || '',
      customer_address: preselectedClient?.address || '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_year: new Date().getFullYear(),
      vehicle_vin: '',
      notes: '',
      invoice_items: [],
      due_date: null,
      subtotal: 0,
      gst_amount: 0,
      qst_amount: 0,
      total: 0
    }
  })

  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      // Calculate totals
      const subtotal = values.invoice_items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      )

      // Create invoice
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          customer_first_name: values.customer_first_name,
          customer_last_name: values.customer_last_name,
          customer_email: values.customer_email,
          customer_phone: values.customer_phone,
          customer_address: values.customer_address,
          vehicle_make: values.vehicle_make,
          vehicle_model: values.vehicle_model,
          vehicle_year: values.vehicle_year,
          vehicle_vin: values.vehicle_vin,
          notes: values.notes,
          due_date: values.due_date,
          subtotal,
          total: subtotal, // Add tax calculation if needed
          status: 'draft',
          client_id: preselectedClient?.id // Add client reference
        })
        .select()
        .single()

      if (error) throw error

      // Create invoice items
      if (invoice && values.invoice_items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            values.invoice_items.map(item => ({
              invoice_id: invoice.id,
              service_id: item.service_id,
              service_name: item.service_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              description: item.description
            }))
          )

        if (itemsError) throw itemsError
      }

      toast.success("Invoice created successfully")
      navigate(`/admin/invoices/${invoice.id}/edit`)
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error("Failed to create invoice")
    }
  }

  // Fetch default vehicle if client is preselected
  useEffect(() => {
    if (preselectedClient?.id) {
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
          form.setValue('vehicle_make', vehicles.make)
          form.setValue('vehicle_model', vehicles.model)
          form.setValue('vehicle_year', vehicles.year)
          form.setValue('vehicle_vin', vehicles.vin || '')
        }
      }

      fetchDefaultVehicle()
    }
  }, [preselectedClient?.id, form])

  return (
    <div className="container mx-auto">
      <div className="flex items-center gap-4 p-6 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/invoices")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageTitle 
          title="Create Invoice" 
          description="Create a new invoice for a customer"
        />
      </div>
      
      <div className="p-6">
        <EditInvoiceForm
          form={form}
          onSubmit={onSubmit}
          isPending={false}
          invoiceId={undefined}
        />
      </div>
    </div>
  )
}
