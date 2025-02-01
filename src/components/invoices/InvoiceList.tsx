import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { InvoiceView } from "./InvoiceView"
import { InvoiceListItem } from "./sections/InvoiceListItem"

export function InvoiceList() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          work_order:work_orders (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data
    },
  })

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    const { error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", invoiceId)

    if (error) {
      console.error("Error updating invoice status:", error)
    }
  }

  const handleEdit = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId)
    setEditDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
    )
  }

  return (
    <div className="space-y-4">
      {invoices?.map((invoice) => (
        <InvoiceListItem
          key={invoice.id}
          invoice={invoice}
          onEdit={handleEdit}
          onStatusChange={updateInvoiceStatus}
        />
      ))}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {selectedInvoiceId && (
            <InvoiceView 
              invoiceId={selectedInvoiceId} 
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}