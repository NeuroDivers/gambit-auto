
import { useInvoiceList } from "./hooks/useInvoiceList"
import { InvoiceListItem } from "./sections/InvoiceListItem"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { InvoiceDialog } from "./sections/InvoiceDialog"
import { Invoice } from "./types"

export function InvoiceList() {
  const { data: invoices, isLoading } = useInvoiceList()
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setEditDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setSelectedInvoice(null)
    setEditDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="w-full h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {invoices?.map((invoice) => (
        <InvoiceListItem 
          key={invoice.id} 
          invoice={invoice} 
          onEdit={handleEditInvoice}
        />
      ))}
      <InvoiceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        invoiceId={selectedInvoice?.id || null}
        onClose={handleCloseDialog}
      />
    </div>
  )
}
