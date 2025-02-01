import { Card, CardContent } from "@/components/ui/card"
import { InvoiceHeader } from "./InvoiceHeader"
import { CustomerInfo } from "./CustomerInfo"
import { VehicleInfo } from "./VehicleInfo"
import { ServicesList } from "./ServicesList"
import { InvoiceTotals } from "./InvoiceTotals"
import { InvoiceFooter } from "./InvoiceFooter"

type InvoiceCardProps = {
  invoice: any // Using any temporarily, should be properly typed
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  if (!invoice) return null

  return (
    <div className="space-y-8 text-[#1A1F2C]">
      <div className="flex justify-between items-start gap-4">
        <InvoiceHeader
          invoiceNumber={invoice.invoice_number}
          createdAt={invoice.created_at}
          dueDate={invoice.due_date}
        />
        <div className="shrink-0">
          <div className="px-4 py-1 rounded-full text-sm font-medium bg-[#FEF7CD] text-[#B99F24]">
            {invoice.status.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <CustomerInfo
          firstName={invoice.work_order.first_name}
          lastName={invoice.work_order.last_name}
          email={invoice.work_order.email}
          phoneNumber={invoice.work_order.phone_number}
        />

        <VehicleInfo
          year={invoice.work_order.vehicle_year}
          make={invoice.work_order.vehicle_make}
          model={invoice.work_order.vehicle_model}
          serial={invoice.work_order.vehicle_serial}
        />
      </div>

      <ServicesList services={invoice.work_order.services || []} />

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