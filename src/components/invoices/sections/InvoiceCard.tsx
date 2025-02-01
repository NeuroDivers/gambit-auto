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
    <Card className="w-full bg-white shadow-lg print:shadow-none">
      <CardContent className="p-8 space-y-8 text-[#222222]">
        <div className="relative">
          <div className="absolute right-0 top-0">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              invoice.status === 'paid' 
                ? 'bg-[#F2FCE2] text-green-700'
                : invoice.status === 'overdue'
                ? 'bg-red-50 text-red-700'
                : 'bg-[#FEF7CD] text-yellow-700'
            }`}>
              {invoice.status.toUpperCase()}
            </div>
          </div>
          <InvoiceHeader
            invoiceNumber={invoice.invoice_number}
            createdAt={invoice.created_at}
            dueDate={invoice.due_date}
          />
        </div>

        <div className="grid grid-cols-2 gap-8 bg-[#F1F0FB] p-6 rounded-lg">
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

        <div className="bg-[#F1F0FB] p-6 rounded-lg">
          <InvoiceTotals
            subtotal={invoice.subtotal}
            taxAmount={invoice.tax_amount}
            total={invoice.total}
          />
        </div>

        {invoice.notes && (
          <div className="border-t border-gray-200 pt-6">
            <h2 className="font-semibold mb-2 text-[#222222]">Notes</h2>
            <p className="text-[#333333]">{invoice.notes}</p>
          </div>
        )}

        <InvoiceFooter />
      </CardContent>
    </Card>
  )
}