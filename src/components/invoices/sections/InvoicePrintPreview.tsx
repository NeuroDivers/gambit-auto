import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type InvoicePrintPreviewProps = {
  invoice: any
}

export function InvoicePrintPreview({ invoice }: InvoicePrintPreviewProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice?.invoice_number}`,
    content: () => componentRef.current,
    onAfterPrint: () => console.log('Printed successfully'),
    pageStyle: '@page { size: auto; margin: 20mm; }',
    onPrintError: (error) => console.error('Failed to print:', error)
  })

  if (!invoice) return null

  const calculateItemTotal = (item: any) => {
    return (item.quantity * item.unit_price).toFixed(2)
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button 
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Invoice
        </Button>
      </div>

      <div ref={componentRef}>
        <div className="p-8 bg-white rounded-lg shadow">
          {/* Company Info */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{invoice.company_name}</h1>
            <p className="text-gray-600">{invoice.company_address}</p>
            <p className="text-gray-600">{invoice.company_phone}</p>
            <p className="text-gray-600">{invoice.company_email}</p>
            {invoice.gst_number && <p className="text-gray-600">GST: {invoice.gst_number}</p>}
            {invoice.qst_number && <p className="text-gray-600">QST: {invoice.qst_number}</p>}
          </div>

          {/* Invoice Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Invoice #{invoice.invoice_number}</h2>
            <div className="mt-2 text-gray-600">
              <p>Date: {formatDate(invoice.created_at)}</p>
              {invoice.due_date && <p>Due Date: {formatDate(invoice.due_date)}</p>}
              <p className="mt-2">Status: <span className="capitalize">{invoice.status}</span></p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Bill To:</h3>
            <p>{invoice.customer_name}</p>
            <p>{invoice.customer_email}</p>
            <p className="whitespace-pre-wrap">{invoice.customer_address}</p>
          </div>

          {/* Vehicle Info */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Vehicle Information</h3>
            <p>{invoice.vehicle_year} {invoice.vehicle_make} {invoice.vehicle_model}</p>
            {invoice.vehicle_vin && <p>VIN: {invoice.vehicle_vin}</p>}
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Services</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Service</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Quantity</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.invoice_items?.map((item: any) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.service_name}</td>
                    <td className="py-2">{item.description}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">${item.unit_price.toFixed(2)}</td>
                    <td className="text-right py-2">${calculateItemTotal(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span>Subtotal:</span>
                <span>${invoice.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Tax:</span>
                <span>${invoice.tax_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold">
                <span>Total:</span>
                <span>${invoice.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 border-t pt-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}