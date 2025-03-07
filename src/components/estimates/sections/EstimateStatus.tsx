
import { Badge } from "@/components/ui/badge"

export function EstimateStatus({ status }) {
  const getVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "draft"
      case "sent":
        return "sent"
      case "approved":
        return "accepted" // Map to theme editor variable
      case "rejected":
        return "rejected"
      case "expired":
        return "expired"
      case "converted":
        return "converted"
      default:
        return "draft"
    }
  }

  return (
    <Badge variant={getVariant(status)}>
      {status || "Draft"}
    </Badge>
  )
}
