
// Define standard badge variants for different status types

// Work Order Status Variants
export const getWorkOrderStatusVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "pending"
    case "approved":
      return "approved"
    case "rejected":
      return "rejected"
    case "in_progress":
      return "info"
    case "completed":
      return "success"
    case "cancelled":
      return "destructive"
    case "invoiced":
      return "secondary"
    case "estimated":
      return "warning"
    default:
      return "default"
  }
}

// Invoice Status Variants
export const getInvoiceStatusVariant = (status: string) => {
  switch (status) {
    case "draft":
      return "draft"
    case "sent":
      return "sent"
    case "paid":
      return "success"
    case "overdue":
      return "destructive"
    case "pending":
      return "outline"
    default:
      return "default"
  }
}

// Quote Status Variants
export const getQuoteStatusVariant = (status: string) => {
  switch (status) {
    case "draft":
      return "draft"
    case "sent":
      return "sent"
    case "accepted":
      return "accepted"
    case "rejected":
      return "rejected"
    case "expired":
      return "expired"
    case "pending":
      return "outline"
    case "estimated":
      return "warning"
    case "in_progress":
      return "info"
    case "estimate_pending":
      return "warning"
    case "converted":
      return "converted"
    default:
      return "default"
  }
}
