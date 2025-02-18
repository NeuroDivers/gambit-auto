
import { EditInvoiceForm } from "@/components/invoices/sections/EditInvoiceForm"
import { PageTitle } from "@/components/shared/PageTitle"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { InvoiceFormValues } from "@/components/invoices/types"

export default function CreateInvoice() {
  const navigate = useNavigate()
  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      status: 'draft',
      customer_first_name: '',
      customer_last_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
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
          status: 'draft'
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

  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-4 p-6 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageTitle 
          title="Create Invoice" 
          description="Create a new invoice for a customer"
        />
      </div>
      
      <EditInvoiceForm
        form={form}
        onSubmit={onSubmit}
        isPending={false}
        invoiceId={undefined}
      />
    </div>
  )
}
