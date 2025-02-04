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
  if (!invoice || !businessProfile) {
    return <div>No invoice data available</div>
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="max-w-4xl mx-auto space-y-8">
          <InvoiceHeader 
            invoiceNumber={invoice.invoice_number}
            createdAt={invoice.created_at}
            dueDate={invoice.due_date}
            status={invoice.status}
          />
          <div className="grid md:grid-cols-2 gap-8">
            <CustomerInfo 
              customerFirstName={invoice.customer_first_name || ''}
              customerLastName={invoice.customer_last_name || ''}
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
          <InvoiceServiceItems items={invoice.invoice_items || []} />
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