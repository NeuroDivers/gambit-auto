
import { EditInvoiceForm } from "@/components/invoices/sections/EditInvoiceForm"
import { PageTitle } from "@/components/shared/PageTitle"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export default function CreateInvoice() {
  const navigate = useNavigate()
  const form = useForm({
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
      items: [],
      due_date: null
    }
  })

  const onSubmit = async (values: any) => {
    try {
      // Calculate totals
      const subtotal = values.items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unit_price), 0
      )

      // Create invoice
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          ...values,
          subtotal,
          total: subtotal, // Add tax calculation if needed
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

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
