import { useReactToPrint } from "react-to-print"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Invoice } from "../types"

type InvoicePrintPreviewProps = {
  invoice: Invoice
}

export function InvoicePrintPreview({ invoice }: InvoicePrintPreviewProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice?.invoice_number}`,
    pageStyle: `
      @page {
        size: auto;
        margin: 20mm;
      }
    `,
    content: () => componentRef.current,
  })

  if (!invoice) {
    return <div>No invoice data available</div>
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handlePrint()} className="gap-2">
          <Printer className="w-4 h-4" />
          Print Invoice
        </Button>
      </div>

      <div ref={componentRef} className="bg-white text-black p-8">
        <div className="space-y-6">
          {/* Company Information */}
          <div>
            <h2 className="text-2xl font-bold">{invoice.company_name}</h2>
            <p>{invoice.company_address}</p>
            <p>Phone: {invoice.company_phone}</p>
            <p>Email: {invoice.company_email}</p>
            {invoice.gst_number && <p>GST: {invoice.gst_number}</p>}
            {invoice.qst_number && <p>QST: {invoice.qst_number}</p>}
          </div>

          {/* Invoice Details */}
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">Bill To:</h3>
              <p>{invoice.customer_name}</p>
              {invoice.customer_address && <p>{invoice.customer_address}</p>}
              <p>{invoice.customer_email}</p>
              {invoice.customer_phone && <p>Phone: {invoice.customer_phone}</p>}
            </div>
            <div className="text-right">
              <p><span className="font-semibold">Invoice #:</span> {invoice.invoice_number}</p>
              <p><span className="font-semibold">Date:</span> {new Date(invoice.created_at).toLocaleDateString()}</p>
              {invoice.due_date && (
                <p><span className="font-semibold">Due Date:</span> {new Date(invoice.due_date).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {/* Vehicle Information */}
          {(invoice.vehicle_make || invoice.vehicle_model || invoice.vehicle_year || invoice.vehicle_vin) && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Vehicle Information:</h3>
              <div className="grid grid-cols-2 gap-4">
                {invoice.vehicle_make && (
                  <p><span className="font-semibold">Make:</span> {invoice.vehicle_make}</p>
                )}
                {invoice.vehicle_model && (
                  <p><span className="font-semibold">Model:</span> {invoice.vehicle_model}</p>
                )}
                {invoice.vehicle_year && (
                  <p><span className="font-semibold">Year:</span> {invoice.vehicle_year}</p>
                )}
                {invoice.vehicle_vin && (
                  <p><span className="font-semibold">VIN:</span> {invoice.vehicle_vin}</p>
                )}
              </div>
            </div>
          )}

          {/* Invoice Items */}
          <div className="border-t pt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Service</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Quantity</th>
                  <th className="text-right py-2">Unit Price</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.invoice_items?.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.service_name}</td>
                    <td className="py-2">{item.description}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">{formatCurrency(item.unit_price)}</td>
                    <td className="text-right py-2">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end space-y-2">
              <table className="w-48">
                <tbody>
                  <tr>
                    <td className="py-1">Subtotal:</td>
                    <td className="text-right py-1">{formatCurrency(invoice.subtotal)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Tax:</td>
                    <td className="text-right py-1">{formatCurrency(invoice.tax_amount)}</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="py-1">Total:</td>
                    <td className="text-right py-1">{formatCurrency(invoice.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Notes:</h3>
              <p className="whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}