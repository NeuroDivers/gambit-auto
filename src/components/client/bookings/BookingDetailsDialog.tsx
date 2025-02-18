
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Car, MapPin, Image as ImageIcon } from "lucide-react"
import { format } from "date-fns"

interface BookingDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: {
    id: string
    vehicle_year: number
    vehicle_make: string
    vehicle_model: string
    start_time: string
    status: string
    service_bays?: {
      name: string
    }
    work_order_services: Array<{
      service_id: string
      service_types: {
        name: string
      }
    }>
  } | null
}

export function BookingDetailsDialog({ open, onOpenChange, booking }: BookingDetailsDialogProps) {
  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-1">
            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Make:</span>
                    <p className="font-medium">{booking.vehicle_make}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Model:</span>
                    <p className="font-medium">{booking.vehicle_model}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Year:</span>
                    <p className="font-medium">{booking.vehicle_year}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Service Bay:</span>
                    <p className="font-medium">{booking.service_bays?.name || 'Not assigned'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  123 Auto Service Street<br />
                  Montreal, QC H2B 1V1
                </p>
              </CardContent>
            </Card>

            {/* Inspection Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Inspection Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Before Service</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Placeholder for before images */}
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">After Service</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Placeholder for after images */}
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
