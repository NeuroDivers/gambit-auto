
import { InvoiceList } from "@/components/invoices/InvoiceList"
import { PageTitle } from "@/components/shared/PageTitle"

export default function ClientInvoices() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageTitle>Your Invoices</PageTitle>
      <InvoiceList />
    </div>
  )
}
