
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { FileText, Car, Calendar, Check, X } from "lucide-react"
import { format } from "date-fns"
import type { QuoteRequest } from "@/types/quote-request"

interface QuoteRequestMobileListProps {
  requests: QuoteRequest[]
  onRowClick: (id: string, type: 'request') => void
}

export function QuoteRequestMobileList({ requests, onRowClick }: QuoteRequestMobileListProps) {
  if (!requests.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No quote requests found
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card 
          key={request.id} 
          className="p-4 space-y-4 cursor-pointer hover:bg-accent/5"
          onClick={() => onRowClick(request.id, 'request')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">
                {request.client?.first_name} {request.client?.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{request.client?.email}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge 
                variant={
                  request.status === 'accepted' ? 'default' : 
                  request.status === 'rejected' ? 'destructive' : 
                  'secondary'
                }
              >
                {request.status}
              </Badge>
              {request.client_response && (
                <Badge 
                  variant={request.client_response === "accepted" ? "success" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {request.client_response === "accepted" ? (
                    <>
                      <Check className="h-3 w-3" />
                      Accepted
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3" />
                      Rejected
                    </>
                  )}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Car className="h-4 w-4" />
              {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {request.service_ids?.length || 0} services
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(request.created_at), 'MMM d, yyyy')}
            </div>

            {request.description && (
              <p className="text-sm text-muted-foreground border-t pt-2 mt-2">
                {request.description}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
