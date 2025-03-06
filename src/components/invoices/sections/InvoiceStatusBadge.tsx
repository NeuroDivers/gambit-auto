
import { Badge } from "@/components/ui/badge"

interface InvoiceStatusBadgeProps {
  status: string
}

const getInvoiceStatusVariant = (status: string) => {
  switch (status) {
    case "paid":
      return "success"
    case "pending":
      return "warning"
    case "overdue":
      return "destructive"
    case "draft":
      return "secondary"
    case "cancelled":
      return "outline"
    default:
      return "default"
  }
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const variant = getInvoiceStatusVariant(status)
  
  return (
    <Badge variant={variant as any}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
