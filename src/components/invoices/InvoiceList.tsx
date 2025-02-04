import { useState, useEffect } from "react"
import { InvoiceListItem } from "./sections/InvoiceListItem"
import { InvoiceDialog } from "./sections/InvoiceDialog"
import { useInvoiceList } from "./hooks/useInvoiceList"
import { Toaster } from "sonner"

export function InvoiceList() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { invoices, isLoading, setupRealtimeSubscription, updateInvoiceStatus } = useInvoiceList()

  useEffect(() => {
    return setupRealtimeSubscription()
  }, [])

  const handleEdit = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId)
    setEditDialogOpen(true)
  }

  const handleClose = () => {
    setEditDialogOpen(false)
    setSelectedInvoiceId(null)
  }

  if (isLoading) {
    return (
      <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
    )
  }

  return (
    <div className="space-y-4">
      <Toaster />
      {invoices?.map((invoice) => (
        <InvoiceListItem
          key={invoice.id}
          invoice={invoice}
          onEdit={handleEdit}
          onStatusChange={updateInvoiceStatus}
        />
      ))}

      <InvoiceDialog 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        invoiceId={selectedInvoiceId}
        onClose={handleClose}
      />
    </div>
  )
}