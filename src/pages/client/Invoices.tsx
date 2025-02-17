
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"

export default function ClientInvoices() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <PageBreadcrumbs />
        <h1 className="text-2xl md:text-3xl font-bold">My Invoices</h1>
      </div>
      {/* Content goes here */}
    </div>
  )
}
