
import { formatDistanceToNow, format } from "date-fns"
import { Invoice } from "../types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Printer, PencilIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"

type InvoiceListItemProps = {
  invoice: Invoice
}

export function InvoiceListItem({ invoice }: InvoiceListItemProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase.rpc('has_role_by_name', {
        user_id: user.id,
        role_name: 'administrator'
      })
      
      return !!data
    }
  })

  // Check if user is a client
  const { data: isClient } = useQuery({
    queryKey: ["isClient"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase.rpc('has_role_by_name', {
        user_id: user.id,
        role_name: 'client'
      })
      
      return !!data
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
      case 'sent':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
      case 'paid':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      case 'overdue':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
    }
  }

  const updateInvoiceStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoice.id)

      if (error) throw error

      toast.success(`Invoice status updated to ${newStatus}`)
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    } catch (error) {
      console.error('Error updating invoice status:', error)
      toast.error('Failed to update invoice status')
    }
  }

  const handleViewClick = () => {
    if (isClient) {
      // Redirect to public invoice view for clients
      navigate(`/client/invoices/public/${invoice.id}`)
    } else {
      // Redirect to admin invoice view
      navigate(`/invoices/${invoice.id}`)
    }
  }

  return (
    <Card className="p-6 hover:border-primary/50 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
            {isAdmin ? (
              <Select
                defaultValue={invoice.status}
                onValueChange={updateInvoiceStatus}
              >
                <SelectTrigger className={`w-[130px] ${getStatusColor(invoice.status)}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge className={getStatusColor(invoice.status)} variant="secondary">
                {invoice.status}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {invoice.customer_first_name} {invoice.customer_last_name}
          </p>
          <p className="text-sm text-muted-foreground">
            Created {formatDistanceToNow(new Date(invoice.created_at))} ago
          </p>
          {invoice.status !== 'paid' && invoice.due_date && (
            <p className="text-sm text-muted-foreground">
              Due {format(new Date(invoice.due_date), "MMM d, yyyy")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="text-right mr-4">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-lg font-semibold">${invoice.total?.toFixed(2)}</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
            {isAdmin && invoice.status === 'draft' && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
            )}
            <Button 
              onClick={handleViewClick}
              className="gap-2"
            >
              View
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
