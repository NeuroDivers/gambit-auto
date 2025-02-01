import { Badge } from "@/components/ui/badge"
import { CardHeader, CardTitle } from "@/components/ui/card"

type BayCardHeaderProps = {
  name: string
  status: 'available' | 'in_use' | 'maintenance'
}

export function BayCardHeader({ name, status }: BayCardHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'in_use':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'maintenance':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      default:
        return ''
    }
  }

  return (
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <CardTitle className="text-lg">{name}</CardTitle>
        <Badge className={`border ${getStatusColor(status)}`}>
          {status}
        </Badge>
      </div>
    </CardHeader>
  )
}