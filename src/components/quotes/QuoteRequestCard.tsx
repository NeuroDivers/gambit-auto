
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Calendar, Archive, Clock } from "lucide-react"
import type { QuoteRequest } from "@/types/quote-request"
import { useNavigate } from "react-router-dom"

interface QuoteRequestCardProps {
  request: QuoteRequest
  services: any[]
  onStatusChange: (id: string, status: QuoteRequest['status']) => void
  onDelete: (id: string) => void
  onArchiveToggle: (id: string, currentArchiveStatus: boolean) => void
  estimateAmount: Record<string, string>
  setEstimateAmount: (value: Record<string, string>) => void
  onEstimateSubmit: (id: string, estimates: Record<string, string>) => void
}

export function QuoteRequestCard({
  request,
  services,
  onStatusChange,
  onDelete,
  onArchiveToggle,
  estimateAmount,
  setEstimateAmount,
  onEstimateSubmit,
}: QuoteRequestCardProps) {
  const navigate = useNavigate()

  const statusVariant = {
    pending: "secondary",
    estimated: "default",
    accepted: "outline",
    rejected: "destructive",
    converted: "success"
  } as const

  const requestedServices = request.service_ids
    .map(id => services?.find(s => s.id === id)?.name)
    .filter(Boolean)
    .join(", ")

  const timeSinceCreation = () => {
    const created = new Date(request.created_at)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <Card className={`hover:bg-accent/5 transition-colors ${request.is_archived ? 'opacity-75' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium truncate">
                {request.vehicle_make} {request.vehicle_model} ({request.vehicle_year})
              </h3>
              <Badge variant={statusVariant[request.status as keyof typeof statusVariant]}>
                {request.status}
              </Badge>
              {request.estimated_amount && (
                <span className="text-sm font-medium text-muted-foreground">
                  ${request.estimated_amount.toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(request.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Clock className="h-4 w-4" />
                <span>{timeSinceCreation()}</span>
              </div>
            </div>
            
            {requestedServices && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                Services: {requestedServices}
              </p>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/quotes/${request.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchiveToggle(request.id, request.is_archived || false)}
            >
              <Archive className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
