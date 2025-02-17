
import { CustomerInfo } from "./CustomerInfo"
import { VehicleInfo } from "./VehicleInfo"
import { ServicesList } from "./ServicesList"
import { InvoiceTotals } from "./InvoiceTotals"
import { InvoiceFooter } from "./InvoiceFooter"
import { InvoiceHeader } from "./InvoiceHeader"
import { Invoice } from "../types"

type InvoiceCardProps = {
  invoice: Invoice
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  if (!invoice) return null

  // Calculate total tax amount for display
  const totalTaxAmount = (invoice.gst_amount || 0) + (invoice.qst_amount || 0)

  return (
    <div className="space-y-8 text-[#1A1F2C]">
      <InvoiceHeader
        invoiceNumber={invoice.invoice_number}
        createdAt={invoice.created_at}
        dueDate={invoice.due_date}
        status={invoice.status}
      />

      <div className="grid grid-cols-2 gap-8">
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

      <ServicesList services={invoice.invoice_items || []} />

      <div>
        <InvoiceTotals
          subtotal={invoice.subtotal}
          taxAmount={totalTaxAmount}
          total={invoice.total}
        />
      </div>

      {invoice.notes && (
        <div className="pt-6">
          <h2 className="font-semibold mb-2 text-[#1A1F2C]">Notes</h2>
          <p className="text-[#8E9196]">{invoice.notes}</p>
        </div>
      )}

      <InvoiceFooter />
    </div>
  )
}
