
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { InvoiceList } from "@/components/invoices/InvoiceList"
import { Button } from "@/components/ui/button"
import { FilePlus, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog"
import { useState } from "react"

export default function Invoices() {
  const navigate = useNavigate()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <PageBreadcrumbs />
              <h1 className="text-3xl font-bold">Invoices</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Quick Create
              </Button>
              <Button 
                onClick={() => navigate("/work-orders")} 
                variant="outline"
                className="gap-2"
              >
                <FilePlus className="h-4 w-4" />
                Create from Work Order
              </Button>
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto">
          <InvoiceList />
        </div>
      </div>
      <CreateInvoiceDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
