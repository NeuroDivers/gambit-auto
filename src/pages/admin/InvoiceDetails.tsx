
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { PageTitle } from "@/components/shared/PageTitle"
import { InvoiceActions } from "@/components/invoices/sections/InvoiceActions"
import { useReactToPrint } from 'react-to-print'
import { useRef, useState, useEffect } from 'react'
import { CustomerInfoCard } from "@/components/invoices/sections/CustomerInfoCard"
import { VehicleInfoCard } from "@/components/invoices/sections/VehicleInfoCard"
import { InvoiceDetailsCard } from "@/components/invoices/sections/InvoiceDetailsCard"
import { CommissionsSection } from "@/components/invoices/sections/CommissionsSection"
import { useInvoiceSubscription } from "@/hooks/useInvoiceSubscription"

export default function InvoiceDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const printRef = useRef<HTMLDivElement>(null)
  const [invoice, setInvoice] = useState<any>(null)
  
  // Set up global invoice subscription
  useInvoiceSubscription()

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Invoice',
    pageStyle: '@page { margin: 1cm }'
  })

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (!id) throw new Error("Invoice ID is required")

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (
            id,
            service_name,
            quantity,
            unit_price,
            description,
            commission_rate,
            commission_type,
            assigned_profile_id
          )
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error("Invoice not found")

      return data
    },
    enabled: !!id
  })

  useEffect(() => {
    if (data) {
      setInvoice(data)
    }
  }, [data])

  useEffect(() => {
    if (!id) return
    
    console.log("Setting up realtime subscription for invoice:", id)
    
    const channel = supabase
      .channel('invoice-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Invoice change detected:', payload)
          if (payload.new && typeof payload.new === 'object') {
            setInvoice(prevInvoice => {
              if (!prevInvoice) return payload.new
              return { ...prevInvoice, ...payload.new }
            })
          }
        }
      )
      .subscribe()

    return () => {
      console.log("Cleaning up realtime subscription")
      supabase.removeChannel(channel)
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!invoice) {
    throw new Error("Failed to load invoice details")
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageTitle 
            title={`Invoice ${invoice.invoice_number}`}
            description="View and manage invoice details"
          />
        </div>
        <InvoiceActions 
          invoiceId={id} 
          invoiceNumber={invoice.invoice_number}
          onPrint={handlePrint}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CustomerInfoCard
          firstName={invoice.customer_first_name}
          lastName={invoice.customer_last_name}
          email={invoice.customer_email}
          phone={invoice.customer_phone}
          address={invoice.customer_address}
        />

        <VehicleInfoCard
          year={invoice.vehicle_year}
          make={invoice.vehicle_make}
          model={invoice.vehicle_model}
          vin={invoice.vehicle_vin}
        />

        <div className="md:col-span-2">
          <InvoiceDetailsCard
            ref={printRef}
            status={invoice.status}
            items={invoice.invoice_items}
            subtotal={invoice.subtotal}
            gstAmount={invoice.gst_amount}
            qstAmount={invoice.qst_amount}
            total={invoice.total}
            notes={invoice.notes}
            createdAt={invoice.created_at}
            dueDate={invoice.due_date}
            updatedAt={invoice.updated_at}
          />
        </div>

        <div className="md:col-span-2">
          <CommissionsSection 
            invoiceId={id}
            items={invoice.invoice_items}
          />
        </div>
      </div>
    </div>
  )
}
