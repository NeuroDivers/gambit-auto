import { useForm } from "react-hook-form"
import { EditInvoiceForm } from './sections/EditInvoiceForm'
import { InvoicePrintPreview } from './sections/InvoicePrintPreview'
import { InvoiceFormValues } from "./types"
import { useInvoiceData } from "./hooks/useInvoiceData"
import { useInvoiceMutation } from "./hooks/useInvoiceMutation"
import { useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useReactToPrint } from 'react-to-print'
import { InvoiceActions } from "./sections/InvoiceActions"

type InvoiceViewProps = {
  invoiceId?: string
  isEditing?: boolean
  isPublic?: boolean
  onClose?: () => void
}

export function InvoiceView({ invoiceId, isEditing, isPublic, onClose }: InvoiceViewProps) {
  const { data: invoice, isLoading: isInvoiceLoading } = useInvoiceData(invoiceId)
  const updateInvoiceMutation = useInvoiceMutation(invoiceId)
  const printRef = useRef<HTMLDivElement>(null)

  // Check if user is admin
  const { data: userRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single()
      
      return roleData?.role
    }
  })

  const isAdmin = userRole === 'admin'

  // Also fetch business profile data which is needed for the invoice
  const { data: businessProfile, isLoading: isBusinessLoading } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
  })

  // Only fetch taxes if we have a business profile
  const { data: taxes } = useQuery({
    queryKey: ["business-taxes", businessProfile?.id],
    queryFn: async () => {
      if (!businessProfile?.id) return []
      
      const { data, error } = await supabase
        .from("business_taxes")
        .select("*")
        .eq("business_id", businessProfile.id)

      if (error) throw error
      return data
    },
    enabled: !!businessProfile?.id,
  })

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice?.invoice_number || 'draft'}`,
    onAfterPrint: () => toast.success("Invoice printed successfully"),
    onPrintError: () => toast.error("Failed to print invoice"),
    pageStyle: "@page { size: auto; margin: 20mm; }",
    contentRef: printRef,
  })

  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      notes: '',
      status: 'draft',
      invoice_items: [],
      customer_first_name: '',
      customer_last_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_year: 0,
      vehicle_vin: ''
    }
  })

  useEffect(() => {
    if (invoice) {
      // Fetch invoice items
      const fetchInvoiceItems = async () => {
        const { data: items, error } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', invoice.id)

        if (error) {
          console.error('Error fetching invoice items:', error)
          return
        }

        // Reset form with all invoice data including items
        form.reset({
          notes: invoice.notes || '',
          status: invoice.status || 'draft',
          invoice_items: items || [],
          customer_first_name: invoice.customer_first_name || '',
          customer_last_name: invoice.customer_last_name || '',
          customer_email: invoice.customer_email || '',
          customer_phone: invoice.customer_phone || '',
          customer_address: invoice.customer_address || '',
          vehicle_make: invoice.vehicle_make || '',
          vehicle_model: invoice.vehicle_model || '',
          vehicle_year: invoice.vehicle_year || 0,
          vehicle_vin: invoice.vehicle_vin || ''
        })
      }

      fetchInvoiceItems()
    }
  }, [invoice, form])

  const handleSubmit = async (values: InvoiceFormValues) => {
    try {
      await updateInvoiceMutation.mutateAsync(values)
      toast.success("Invoice updated successfully")
      onClose?.()
    } catch (error) {
      toast.error("Failed to update invoice")
    }
  }

  if (isInvoiceLoading || isBusinessLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-2/3" />
              <div className="h-20 bg-muted rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-2/3" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <EditInvoiceForm 
        form={form} 
        onSubmit={handleSubmit}
        isPending={updateInvoiceMutation.isPending}
        invoiceId={invoiceId || ''}
      />
    )
  }

  return (
    <div className="space-y-6">
      {(!isPublic || isAdmin) && (
        <InvoiceActions
          invoiceId={invoiceId}
          onPrint={handlePrint}
        />
      )}
      <div ref={printRef}>
        <InvoicePrintPreview invoice={invoice} businessProfile={businessProfile} />
      </div>
    </div>
  )
}