import { Card } from "@/components/ui/card"
import { CustomerInfo } from "./CustomerInfo"
import { VehicleInfo } from "./VehicleInfo"
import { ServicesList } from "./ServicesList"
import { InvoiceTotals } from "./InvoiceTotals"
import { InvoiceFooter } from "./InvoiceFooter"
import { InvoiceHeader } from "./InvoiceHeader"

type InvoiceCardProps = {
  invoice: any // Using any temporarily, should be properly typed
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  if (!invoice) return null

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
          firstName={invoice.customer_name}
          lastName=""
          email={invoice.customer_email}
          phoneNumber=""
        />

        <VehicleInfo
          year={invoice.vehicle_year}
          make={invoice.vehicle_make}
          model={invoice.vehicle_model}
          serial={invoice.vehicle_vin}
        />
      </div>

      <ServicesList services={invoice.invoice_items || []} />

      <div>
        <InvoiceTotals
          subtotal={invoice.subtotal}
          taxAmount={invoice.tax_amount}
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