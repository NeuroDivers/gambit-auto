
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, MapPin, Image as ImageIcon, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"

export default function BookingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!clientData) throw new Error('No client found')

      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          service_bays!fk_work_orders_assigned_bay (
            name
          ),
          work_order_services (
            service_id,
            service_types!work_order_services_main_service_id_fkey (
              name
            )
          )
        `)
        .eq('id', id)
        .eq('client_id', clientData.id)
        .single()

      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!booking) {
    return <div>Booking not found</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <PageBreadcrumbs />
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2"
            onClick={() => navigate('/client/bookings')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bookings
          </Button>
        </div>
      </div>

      <div className="space-y-6">
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
    </div>
  )
}
