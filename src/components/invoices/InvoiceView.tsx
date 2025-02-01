import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PrintButton } from "./sections/PrintButton"
import { InvoiceCard } from "./sections/InvoiceCard"

type InvoiceViewProps = {
  invoiceId?: string
}

export function InvoiceView({ invoiceId }: InvoiceViewProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          work_order:work_orders (
            *,
            services:work_order_services (
              *,
              service:service_types (*)
            )
          )
        `)
        .eq('id', invoiceId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!invoiceId
  })

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice?.invoice_number}`,
    onAfterPrint: () => console.log('Printed successfully'),
    pageStyle: "@page { size: auto; margin: 0mm; }",
    onBeforePrint: () => {
      if (componentRef.current) {
        const element = componentRef.current
        element.style.background = 'white'
      }
    }
  })

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-32 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      <PrintButton onPrint={handlePrint} />
      <div ref={componentRef}>
        <InvoiceCard invoice={invoice} />
      </div>
    </div>
  )
}