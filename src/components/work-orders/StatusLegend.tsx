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
    <div className="flex flex-wrap gap-2 items-center mb-4 p-4 rounded-lg">
      <span className="text-sm font-medium mr-2">Status Legend:</span>
      <Badge className="border text-[rgb(250,204,21)] bg-[rgb(234,179,8,0.2)] border-[rgb(234,179,8,0.3)]">
        pending ({statusCounts.pending})
      </Badge>
      <span className="text-sm text-muted-foreground">awaiting review</span>
      <Badge className="border text-[#0EA5E9] bg-[rgb(14,165,233,0.2)] border-[rgb(14,165,233,0.3)]">
        approved ({statusCounts.approved})
      </Badge>
      <span className="text-sm text-muted-foreground">work order accepted</span>
      <Badge className="border text-[#ea384c] bg-[rgb(234,56,76,0.2)] border-[rgb(234,56,76,0.3)]">
        rejected ({statusCounts.rejected})
      </Badge>
      <span className="text-sm text-muted-foreground">work order declined</span>
      <Badge className="border text-[#9b87f5] bg-[rgb(155,135,245,0.2)] border-[rgb(155,135,245,0.3)]">
        completed ({statusCounts.completed})
      </Badge>
      <span className="text-sm text-muted-foreground">service finished</span>
    </div>
  )
}