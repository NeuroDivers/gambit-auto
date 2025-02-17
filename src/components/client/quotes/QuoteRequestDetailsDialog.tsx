
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { QuoteRequest } from "@/types/quote-request"
import { ServiceTypesTable } from "@/integrations/supabase/types/service-types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface QuoteRequestDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quoteRequest: QuoteRequest | null
  services: ServiceTypesTable["Row"][]
}

export function QuoteRequestDetailsDialog({ 
  open, 
  onOpenChange, 
  quoteRequest,
  services
}: QuoteRequestDetailsDialogProps) {
  if (!quoteRequest) return null

  const getServiceName = (serviceId: string) => {
    const service = services?.find(s => s.id === serviceId)
    return service?.name || "Unknown Service"
  }

  const statusVariant = {
    pending: "secondary",
    estimated: "default",
    accepted: "outline",
    rejected: "destructive"
  } as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Quote Request Details</span>
            <Badge variant={statusVariant[quoteRequest.status as keyof typeof statusVariant]}>
              {quoteRequest.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vehicle Information */}
          <Card>
            <CardHeader className="pb-2">
              <h3 className="font-semibold">Vehicle Information</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Make:</span>
                  <span className="ml-2">{quoteRequest.vehicle_make}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Model:</span>
                  <span className="ml-2">{quoteRequest.vehicle_model}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Year:</span>
                  <span className="ml-2">{quoteRequest.vehicle_year}</span>
                </div>
                {quoteRequest.vehicle_vin && (
                  <div>
                    <span className="text-muted-foreground">VIN:</span>
                    <span className="ml-2">{quoteRequest.vehicle_vin}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Requested Services */}
          <Card>
            <CardHeader className="pb-2">
              <h3 className="font-semibold">Requested Services</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quoteRequest.service_ids.map((serviceId) => (
                  <div key={serviceId} className="flex justify-between items-center">
                    <span>{getServiceName(serviceId)}</span>
                    {quoteRequest.service_estimates?.[serviceId] && (
                      <span className="font-medium">
                        ${quoteRequest.service_estimates[serviceId].toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
                {quoteRequest.estimated_amount && (
                  <>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Estimate</span>
                      <span>${quoteRequest.estimated_amount.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {quoteRequest.description && (
            <Card>
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Additional Details</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{quoteRequest.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Images */}
          {quoteRequest.media_urls && quoteRequest.media_urls.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Uploaded Images</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {quoteRequest.media_urls.map((url, index) => (
                    <img 
                      key={index} 
                      src={url} 
                      alt={`Quote request image ${index + 1}`} 
                      className="rounded-md object-cover w-full aspect-video"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
