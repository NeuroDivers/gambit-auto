import { Badge } from "@/components/ui/badge"
import { CardTitle } from "@/components/ui/card"

type BayHeaderProps = {
  name: string
  status: string
  statusColor: string
}

export function BayHeader({ name, status, statusColor }: BayHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <CardTitle className="text-lg">{name}</CardTitle>
      <Badge className={`border ${statusColor}`}>
        {status}
      </Badge>
    </div>
  )
}