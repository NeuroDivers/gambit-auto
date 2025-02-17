
import { useForm } from "react-hook-form"
import { InvoiceFormValues } from "@/components/invoices/types"
import { EditInvoiceForm } from "@/components/invoices/sections/EditInvoiceForm"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"

export default function CreateInvoice() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
      vehicle_year: 0,
      vehicle_vin: "",
      invoice_items: []
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
    },
    // Initialize with empty array
    initialData: [],
  })

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
      // First check if a client exists with this email
      const { data: existingClient, error: clientLookupError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', values.customer_email)
        .maybeSingle()

      if (clientLookupError) throw clientLookupError

      let clientId: string | null = existingClient?.id

      // If no client exists, create one
      if (!clientId) {
        const { data: newClient, error: createClientError } = await supabase
          .from('clients')
          .insert({
            first_name: values.customer_first_name,
            last_name: values.customer_last_name,
            email: values.customer_email,
            phone_number: values.customer_phone,
            address: values.customer_address
          })
          .select()
          .single()

        if (createClientError) throw createClientError
        clientId = newClient.id
      }

      // Create the invoice with client_id
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
          vehicle_year: values.vehicle_year,
          vehicle_vin: values.vehicle_vin,
          client_id: clientId
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
              quantity: item.quantity,
              unit_price: item.unit_price
            }))
          )

        if (itemsError) throw itemsError
      }

      return invoice
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice created successfully')
      navigate(`/invoices/${data.id}`)
    },
    onError: (error: any) => {
      console.error('Error creating invoice:', error)
      toast.error('Failed to create invoice: ' + error.message)
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
