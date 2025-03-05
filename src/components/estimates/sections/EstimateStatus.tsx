
import { Badge } from "@/components/ui/badge"

export function EstimateStatus({ status }) {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Badge className={getStatusStyles(status)} variant="outline">
      {status || "Draft"}
    </Badge>
  )
}
