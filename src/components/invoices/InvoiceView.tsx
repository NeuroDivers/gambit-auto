
import { useForm } from "react-hook-form"
import { InvoiceFormValues, PrintRef } from "./types"
import { useInvoiceData } from "./hooks/useInvoiceData"
import { useInvoiceMutation } from "./hooks/useInvoiceMutation"
import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useReactToPrint } from 'react-to-print'
import { LoadingState } from "./sections/LoadingState"
import { PublicView } from "./sections/PublicView"
import { AdminView } from "./sections/AdminView"
import { ProfileWithRole } from "@/integrations/supabase/types/user-roles"
import { InvoicePrintPreview } from "./sections/InvoicePrintPreview"

type InvoiceViewProps = {
  invoiceId?: string
  isEditing?: boolean
  isPublic?: boolean
  onClose?: () => void
}

export function InvoiceView({ invoiceId, isEditing, isPublic, onClose }: InvoiceViewProps) {
  const [isVerified, setIsVerified] = useState(false)
  const { data: invoice, isLoading: isInvoiceLoading } = useInvoiceData(invoiceId)
  const updateInvoiceMutation = useInvoiceMutation(invoiceId)
  const printRef = useRef<HTMLDivElement>(null)

  const { data: userRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null
        
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(`
            role:role_id (
              id,
              name,
              nicename
            )
          `)
          .eq("id", user.id)
          .maybeSingle() as { data: ProfileWithRole | null, error: any }
        
        if (profileError) {
          console.error('Error fetching user role:', profileError)
          return null
        }

        return profileData?.role?.name || null
      } catch (error) {
        console.error('Error in userRole query:', error)
        return null
      }
    }
  })

  const isAdmin = userRole === 'administrator'

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
      customer_vehicle_make: '',
      customer_vehicle_model: '',
      customer_vehicle_year: 0,
      customer_vehicle_vin: ''
    }
  })

  useEffect(() => {
    if (invoice) {
      const fetchInvoiceItems = async () => {
        const { data: items, error } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', invoice.id)

        if (error) {
          console.error('Error fetching invoice items:', error)
          return
        }

        form.reset({
          notes: invoice.notes || '',
          status: invoice.status || 'draft',
          invoice_items: items || [],
          customer_first_name: invoice.customer_first_name || '',
          customer_last_name: invoice.customer_last_name || '',
          customer_email: invoice.customer_email || '',
          customer_phone: invoice.customer_phone || '',
          customer_address: invoice.customer_address || '',
          customer_vehicle_make: invoice.customer_vehicle_make || '',
          customer_vehicle_model: invoice.customer_vehicle_model || '',
          customer_vehicle_year: invoice.customer_vehicle_year || 0,
          customer_vehicle_vin: invoice.customer_vehicle_vin || ''
        })
      }

      fetchInvoiceItems()
    }
  }, [invoice, form])

  if (isInvoiceLoading || isBusinessLoading) {
    return <LoadingState />
  }

  // If editing mode is requested, redirect to the edit page instead
  if (isEditing && onClose) {
    // Simply close the dialog as we'll navigate to edit page instead
    onClose()
    return null
  }

  // Create the printRef object that follows our PrintRef interface
  const printRefObject: PrintRef = {
    handlePrint,
    printRef
  }

  return (
    <div className="space-y-6">
      {!isPublic && (
        <AdminView
          invoice={invoice}
          businessProfile={businessProfile}
          invoiceId={invoiceId}
          onPrint={handlePrint}
        />
      )}

      {isPublic ? (
        <PublicView
          invoice={invoice}
          businessProfile={businessProfile}
          isVerified={isVerified}
          setIsVerified={setIsVerified}
          isAdmin={isAdmin}
          onPrint={handlePrint}
          printRef={printRef}
        />
      ) : (
        <div ref={printRef}>
          <InvoicePrintPreview 
            invoice={invoice} 
            businessProfile={businessProfile}
          />
        </div>
      )}
    </div>
  )
}
