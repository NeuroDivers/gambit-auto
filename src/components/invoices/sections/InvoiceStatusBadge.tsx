
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQueryClient } from "@tanstack/react-query"

type InvoiceStatusBadgeProps = {
  status: string
  invoiceId?: string
  editable?: boolean
}

export function getInvoiceStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'draft':
      return 'draft'
    case 'sent':
      return 'sent'
    case 'paid':
      return 'success'
    case 'overdue':
      return 'destructive'
    case 'void':
      return 'secondary'
    case 'partial':
      return 'warning'
    case 'refunded':
      return 'info'
    case 'pending':
      return 'pending'
    default:
      return 'secondary'
  }
}

export function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
}

export function InvoiceStatusBadge({ status, invoiceId, editable = false }: InvoiceStatusBadgeProps) {
  const [currentStatus, setCurrentStatus] = useState<string>(status)
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (status !== currentStatus) {
      setCurrentStatus(status);
    }
  }, [status]);

  useEffect(() => {
    if (!invoiceId) return;
    
    console.log(`Setting up status subscription for invoice ${invoiceId}`);
    
    const channel = supabase
      .channel(`invoice-status-${invoiceId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'invoices',
          filter: `id=eq.${invoiceId}`
        },
        (payload) => {
          console.log('Invoice status change detected:', payload);
          if (payload.new && payload.new.status && payload.new.status !== currentStatus) {
            setCurrentStatus(payload.new.status as string);
            
            if (!isLoading) {
              toast.success(`Invoice status updated to ${getStatusLabel(payload.new.status as string)}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`Cleaning up status subscription for invoice ${invoiceId}`);
      supabase.removeChannel(channel);
    };
  }, [invoiceId, currentStatus, isLoading]);

  const handleStatusChange = async (newStatus: string) => {
    if (!invoiceId) return

    setIsLoading(true)
    try {
      console.log(`Updating invoice ${invoiceId} status to ${newStatus}`)
      
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId)
      
      if (error) {
        console.error("Error updating status:", error)
        throw error
      }
      
      setCurrentStatus(newStatus)
      
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
      
      toast.success(`Invoice status updated to ${getStatusLabel(newStatus)}`);
    } catch (error: any) {
      console.error("Status update error:", error)
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsLoading(false)
    }
  }

  if (editable && invoiceId) {
    return (
      <div className="status-selector">
        <Select
          value={currentStatus}
          onValueChange={(value) => handleStatusChange(value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[160px] status-trigger" data-status={currentStatus}>
            <SelectValue>
              <Badge variant={getInvoiceStatusVariant(currentStatus)}>
                {getStatusLabel(currentStatus)}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">
              <Badge variant="draft">Draft</Badge>
            </SelectItem>
            <SelectItem value="pending">
              <Badge variant="pending">Pending</Badge>
            </SelectItem>
            <SelectItem value="sent">
              <Badge variant="sent">Sent</Badge>
            </SelectItem>
            <SelectItem value="paid">
              <Badge variant="success">Paid</Badge>
            </SelectItem>
            <SelectItem value="partial">
              <Badge variant="warning">Partial</Badge>
            </SelectItem>
            <SelectItem value="overdue">
              <Badge variant="destructive">Overdue</Badge>
            </SelectItem>
            <SelectItem value="void">
              <Badge variant="secondary">Void</Badge>
            </SelectItem>
            <SelectItem value="refunded">
              <Badge variant="info">Refunded</Badge>
            </SelectItem>
          </SelectContent>
        </Select>
        <style>{`
          .status-trigger[data-status="${currentStatus}"] {
            background: transparent;
            border-color: transparent;
            padding-left: 0;
            padding-right: 8px;
            box-shadow: none;
          }
          .status-trigger[data-status="${currentStatus}"]:hover {
            background: transparent;
          }
          .status-selector :global(.select-content) {
            min-width: 140px;
          }
        `}</style>
      </div>
    )
  }

  return (
    <Badge variant={getInvoiceStatusVariant(currentStatus)}>
      {getStatusLabel(currentStatus)}
    </Badge>
  )
}
