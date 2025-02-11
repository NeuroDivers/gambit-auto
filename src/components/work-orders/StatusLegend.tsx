
import { Badge } from "@/components/ui/badge"

type StatusCount = {
  pending: number
  approved: number
  rejected: number
  completed: number
}

type StatusLegendProps = {
  statusCounts: StatusCount
}

export function StatusLegend({ statusCounts }: StatusLegendProps) {
  return (
    <div className="hidden md:flex md:flex-wrap gap-2 items-center mb-4 p-4 rounded-lg">
      <span className="text-sm font-medium mr-2">Status Legend:</span>
      <Badge className="border text-muted-foreground bg-muted/40 border-muted/40">
        pending ({statusCounts.pending})
      </Badge>
      <span className="text-sm text-muted-foreground">awaiting review</span>
      <Badge className="border text-blue-400 bg-[rgb(59,130,246,0.2)] border-[rgb(59,130,246,0.3)]">
        approved ({statusCounts.approved})
      </Badge>
      <span className="text-sm text-muted-foreground">work order accepted</span>
      <Badge className="border text-[#ea384c] bg-[rgb(234,56,76,0.2)] border-[rgb(234,56,76,0.3)]">
        rejected ({statusCounts.rejected})
      </Badge>
      <span className="text-sm text-muted-foreground">work order declined</span>
      <Badge className="border text-green-400 bg-[rgb(34,197,94,0.2)] border-[rgb(34,197,94,0.3)]">
        completed ({statusCounts.completed})
      </Badge>
      <span className="text-sm text-muted-foreground">service finished</span>
    </div>
  )
}
