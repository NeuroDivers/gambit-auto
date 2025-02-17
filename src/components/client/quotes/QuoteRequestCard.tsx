
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Calendar } from "lucide-react"
import type { QuoteRequest } from "@/types/quote-request"
import { useNavigate } from "react-router-dom"

interface QuoteRequestCardProps {
  request: QuoteRequest
  services: any[]
  onAcceptEstimate: (id: string) => void
  onRejectEstimate: (id: string) => void
}

export function QuoteRequestCard({
  request,
  services,
  onAcceptEstimate,
  onRejectEstimate,
}: QuoteRequestCardProps) {
  const navigate = useNavigate()

  const statusVariant = {
    pending: "secondary",
    estimated: "default",
    accepted: "outline",
    rejected: "destructive"
  } as const

  const requestedServices = request.service_ids
    .map(id => services?.find(s => s.id === id)?.name)
    .filter(Boolean)
    .join(", ")

  return (
    <Card className="hover:bg-accent/5 transition-colors">
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
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(request.created_at).toLocaleDateString()}</span>
            </div>
            
            {requestedServices && (
              <p className="text-sm text-muted-foreground truncate">
                Services: {requestedServices}
              </p>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/client/quotes/${request.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>

            {request.status === "estimated" && !request.client_response && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => onAcceptEstimate(request.id)}
                >
                  Accept
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onRejectEstimate(request.id)}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
