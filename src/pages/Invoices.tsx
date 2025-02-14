
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { InvoiceList } from "@/components/invoices/InvoiceList"
import { useNavigate } from "react-router-dom"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"

export default function Invoices() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageBreadcrumbs />
        <Button onClick={() => navigate("/invoices/create")} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>
      <InvoiceList />
    </div>
  )
}
