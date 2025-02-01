import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

type InvoicePrintPreviewProps = {
  invoice: any
}

export function InvoicePrintPreview({ invoice }: InvoicePrintPreviewProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice?.invoice_number}`,
    onAfterPrint: () => console.log('Printed successfully'),
    pageStyle: '@page { size: auto; margin: 20mm; }',
    onPrintError: (error) => console.error('Failed to print:', error)
  })

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button 
          onClick={() => handlePrint()}
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Invoice
        </Button>
      </div>

      <div ref={componentRef}>
        <div className="p-8 bg-white rounded-lg shadow">
          {/* Invoice Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Invoice #{invoice?.invoice_number}</h2>
            <p className="text-gray-600">Date: {new Date(invoice?.created_at).toLocaleDateString()}</p>
          </div>

          {/* Customer Info */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <p>{invoice?.customer_name}</p>
            <p>{invoice?.customer_email}</p>
            <p>{invoice?.customer_address}</p>
          </div>

          {/* Vehicle Info */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Vehicle Information</h3>
            <p>{invoice?.vehicle_year} {invoice?.vehicle_make} {invoice?.vehicle_model}</p>
            <p>VIN: {invoice?.vehicle_vin}</p>
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
                {invoice?.invoice_items?.map((item: any) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.service_name}</td>
                    <td className="py-2">{item.description}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">${item.unit_price.toFixed(2)}</td>
                    <td className="text-right py-2">${(item.quantity * item.unit_price).toFixed(2)}</td>
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
                <span>${invoice?.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Tax:</span>
                <span>${invoice?.tax_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold">
                <span>Total:</span>
                <span>${invoice?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice?.notes && (
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-gray-600">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}