import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Printer } from "lucide-react"
import { useReactToPrint } from "react-to-print"
import { useRef } from "react"

export function InvoiceView({ invoice }: { invoice: any }) {
  const printRef = useRef<HTMLDivElement>(null)
  
  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice.invoice_number}`,
    onAfterPrint: () => console.log('Printed successfully'),
    pageStyle: "@page { size: auto; margin: 20mm; }",
    onBeforeGetContent: () => printRef.current,
  })

  const { data: business } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .single()

      if (error) throw error
      return data
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoice {invoice.invoice_number}</h1>
        <Button onClick={() => handlePrint()} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      <Card className="p-8" ref={printRef}>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between">
            <div>
              <h2 className="font-bold text-xl">{business?.company_name}</h2>
              <p className="text-sm text-muted-foreground">{business?.address}</p>
              <p className="text-sm text-muted-foreground">{business?.phone_number}</p>
              <p className="text-sm text-muted-foreground">{business?.email}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Invoice #{invoice.invoice_number}</p>
              <p className="text-sm text-muted-foreground">
                Date: {format(new Date(invoice.created_at), "MMMM d, yyyy")}
              </p>
              {invoice.due_date && (
                <p className="text-sm text-muted-foreground">
                  Due Date: {format(new Date(invoice.due_date), "MMMM d, yyyy")}
                </p>
              )}
            </div>
          </div>

          {/* Client Info */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-2">Bill To:</h3>
            <p>
              {invoice.work_order.first_name} {invoice.work_order.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {invoice.work_order.email}
            </p>
            <p className="text-sm text-muted-foreground">
              {invoice.work_order.phone_number}
            </p>
          </div>

          {/* Vehicle Info */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-2">Vehicle Information:</h3>
            <p className="text-sm text-muted-foreground">
              {invoice.work_order.vehicle_year} {invoice.work_order.vehicle_make}{" "}
              {invoice.work_order.vehicle_model}
            </p>
            <p className="text-sm text-muted-foreground">
              Serial: {invoice.work_order.vehicle_serial}
            </p>
          </div>

          {/* Services */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Services:</h3>
            <div className="space-y-2">
              {invoice.work_order.work_order_services.map(
                (service: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm py-2 border-b border-border/50"
                  >
                    <span>{service.service.name}</span>
                    <span>${service.service.price}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${invoice.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tax</span>
                <span>${invoice.tax_amount}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${invoice.total}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Notes:</h3>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
