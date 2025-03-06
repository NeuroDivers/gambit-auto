
import { Badge } from "@/components/ui/badge"

type InvoiceStatusBadgeProps = {
  status: string
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
    default:
      return 'secondary'
  }
}

export function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const variant = getInvoiceStatusVariant(status)
  const label = getStatusLabel(status)

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  )
}
