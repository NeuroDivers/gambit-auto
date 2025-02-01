import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Button } from '@/components/ui/button'
import { PrinterIcon } from 'lucide-react'
import { Invoice } from '../types'
import { InvoiceHeader } from './InvoiceHeader'
import { CustomerInfo } from './CustomerInfo'
import { VehicleInfo } from './VehicleInfo'
import { InvoiceServiceItems } from './InvoiceServiceItems'
import { InvoiceTotals } from './InvoiceTotals'
import { InvoiceFooter } from './InvoiceFooter'
import { Tables } from '@/integrations/supabase/types'

type InvoicePrintPreviewProps = {
  invoice: Invoice | null
  businessProfile: Tables<'business_profile'> | null
}

export function InvoicePrintPreview({ invoice, businessProfile }: InvoicePrintPreviewProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice-${invoice?.invoice_number || 'preview'}`,
  })

  if (!invoice || !businessProfile) {
    return <div>No invoice data available</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => handlePrint()} className="gap-2">
          <PrinterIcon className="w-4 h-4" />
          Print Invoice
        </Button>
      </div>

      <div ref={componentRef} className="bg-white p-8 rounded-lg shadow-sm">
        <div className="max-w-4xl mx-auto space-y-8">
          <InvoiceHeader 
            invoiceNumber={invoice.invoice_number}
            createdAt={invoice.created_at}
            dueDate={invoice.due_date}
            status={invoice.status}
          />
          <div className="grid md:grid-cols-2 gap-8">
            <CustomerInfo 
              customerName={invoice.customer_name || ''}
              customerEmail={invoice.customer_email || ''}
              customerPhone={invoice.customer_phone || ''}
              customerAddress={invoice.customer_address || ''}
            />
            <VehicleInfo 
              make={invoice.vehicle_make || ''}
              model={invoice.vehicle_model || ''}
              year={invoice.vehicle_year || 0}
              vin={invoice.vehicle_vin || ''}
            />
          </div>
          <InvoiceServiceItems items={invoice.invoice_items} />
          <InvoiceTotals 
            subtotal={invoice.subtotal}
            taxAmount={invoice.tax_amount}
            total={invoice.total}
          />
          {invoice.notes && (
            <div className="pt-6">
              <h2 className="font-semibold mb-2 text-[#1A1F2C]">Notes</h2>
              <p className="text-[#8E9196]">{invoice.notes}</p>
            </div>
          )}
          <InvoiceFooter />
        </div>
      </div>
    </div>
  )
}