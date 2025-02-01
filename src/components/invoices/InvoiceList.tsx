import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { MoreHorizontal, Pencil } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { InvoiceView } from "./InvoiceView"
import { Link } from "react-router-dom"

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

  if (isLoading) {
    return (
      <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
    )
  }

  return (
    <div className="space-y-4">
      {invoices?.map((invoice) => (
        <Link 
          key={invoice.id} 
          to={`/invoices/${invoice.id}`}
          className="block"
        >
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-semibold">{invoice.invoice_number}</h3>
                  <p className="text-sm text-muted-foreground">
                    {invoice.work_order.first_name} {invoice.work_order.last_name}
                  </p>
                </div>
                <div className="text-right flex-1">
                  <p className="font-semibold">${invoice.total}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(invoice.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault()
                      setSelectedInvoiceId(invoice.id)
                      setEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault()
                        updateInvoiceStatus(invoice.id, "draft")
                      }}>
                        Set as Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault()
                        updateInvoiceStatus(invoice.id, "pending")
                      }}>
                        Set as Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault()
                        updateInvoiceStatus(invoice.id, "paid")
                      }}>
                        Set as Paid
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {selectedInvoiceId && (
            <InvoiceView invoiceId={selectedInvoiceId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}