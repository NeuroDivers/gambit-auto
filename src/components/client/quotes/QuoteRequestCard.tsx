
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Eye } from "lucide-react"
import { useState } from "react"
import { QuoteRequestDetailsDialog } from "./QuoteRequestDetailsDialog"
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const navigate = useNavigate()

  const statusVariant = {
    pending: "secondary",
    estimated: "default",
    accepted: "outline",
    rejected: "destructive"
  } as const

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <h3 className="font-semibold">
              {request.vehicle_make} {request.vehicle_model} ({request.vehicle_year})
            </h3>
            <p className="text-sm text-muted-foreground">
              Submitted on {new Date(request.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={statusVariant[request.status as keyof typeof statusVariant]}>
            {request.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Preview of services */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Requested Services:</h4>
              <div className="flex flex-wrap gap-2">
                {request.service_ids.map((serviceId) => {
                  const service = services?.find(s => s.id === serviceId)
                  return service ? (
                    <Badge key={serviceId} variant="outline">
                      {service.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/client/quotes/${request.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
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

      <QuoteRequestDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        quoteRequest={request}
        services={services}
      />
    </>
  )
}
