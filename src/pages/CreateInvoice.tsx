
import { useForm } from "react-hook-form"
import { InvoiceFormValues } from "@/components/invoices/types"
import { EditInvoiceForm } from "@/components/invoices/sections/EditInvoiceForm"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useLocation, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { useEffect } from "react"

export default function CreateInvoice() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const preselectedClient = location.state?.preselectedClient
  const currentYear = new Date().getFullYear()

  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      status: "draft",
      notes: "",
      customer_first_name: "",
      customer_last_name: "",
      customer_email: "",
      customer_phone: "",
      customer_address: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: currentYear,  // Set a reasonable default year
      vehicle_vin: "",
      invoice_items: [],
      subtotal: 0,
      gst_amount: 0,
      qst_amount: 0,
      total: 0
    }
  })

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('first_name')
      
      if (error) throw error
      return data || []
    }
  })

  useEffect(() => {
    if (preselectedClient) {
      form.setValue('customer_first_name', preselectedClient.first_name)
      form.setValue('customer_last_name', preselectedClient.last_name)
      form.setValue('customer_email', preselectedClient.email)
      form.setValue('customer_phone', preselectedClient.phone_number || '')
      form.setValue('customer_address', preselectedClient.address || '')
    }
  }, [preselectedClient, form])

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients?.find(client => client.id === clientId)
    if (selectedClient) {
      form.setValue('customer_first_name', selectedClient.first_name)
      form.setValue('customer_last_name', selectedClient.last_name)
      form.setValue('customer_email', selectedClient.email)
      form.setValue('customer_phone', selectedClient.phone_number || '')
      form.setValue('customer_address', selectedClient.address || '')
    }
  }

  const { mutate: createInvoice, isPending } = useMutation({
    mutationFn: async (values: InvoiceFormValues) => {
      if (!values.invoice_items || values.invoice_items.length === 0) {
        throw new Error("Please add at least one item to the invoice")
      }

      // Validate vehicle year
      const year = Number(values.vehicle_year)
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        throw new Error(`Vehicle year must be between 1900 and ${currentYear + 1}`)
      }

      // Calculate subtotal
      const subtotal = values.invoice_items.reduce((acc, item) => {
        return acc + (Number(item.quantity) * Number(item.unit_price))
      }, 0)

      // Create the invoice with calculated values
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          status: values.status,
          notes: values.notes,
          customer_first_name: values.customer_first_name,
          customer_last_name: values.customer_last_name,
          customer_email: values.customer_email,
          customer_phone: values.customer_phone,
          customer_address: values.customer_address,
          vehicle_make: values.vehicle_make,
          vehicle_model: values.vehicle_model,
          vehicle_year: year, // Use the validated year
          vehicle_vin: values.vehicle_vin,
          subtotal: subtotal,
          gst_amount: 0, // Will be calculated by trigger
          qst_amount: 0, // Will be calculated by trigger
          total: subtotal // Will be updated by trigger
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Then create the invoice items
      if (values.invoice_items?.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            values.invoice_items.map(item => ({
              invoice_id: invoice.id,
              service_id: item.service_id,
              package_id: item.package_id,
              service_name: item.service_name,
              description: item.description,
              quantity: Number(item.quantity) || 1,
              unit_price: Number(item.unit_price) || 0
            }))
          )

        if (itemsError) throw itemsError
      }

      return invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({
        title: "Success",
        description: "Invoice created successfully"
      })
      navigate("/invoices")
    },
    onError: (error: any) => {
      console.error('Error creating invoice:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive"
      })
    }
  })

  const onSubmit = (values: InvoiceFormValues) => {
    createInvoice(values)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageBreadcrumbs />
      <div className="max-w-5xl mx-auto">
        <EditInvoiceForm
          form={form}
          onSubmit={onSubmit}
          isPending={isPending}
          invoiceId={undefined}
          clients={clients || []}
          isLoadingClients={isLoadingClients}
          onClientSelect={handleClientSelect}
        />
      </div>
    </div>
  )
}
