
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2, MapPin, CalendarClock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar } from "lucide-react"
import { BookingDetailsDialog } from "@/components/client/bookings/BookingDetailsDialog"
import { useState } from "react"

interface WorkOrder {
  id: string
  vehicle_year: number
  vehicle_make: string
  vehicle_model: string
  start_time: string
  status: string
  created_at: string
  service_bays?: {
    name: string
  }
  work_order_services: Array<{
    service_id: string
    service_types: {
      name: string
    }
  }>
}

export default function ClientBookings() {
  const [selectedBooking, setSelectedBooking] = useState<WorkOrder | null>(null)

  const { data: workOrders, isLoading } = useQuery<WorkOrder[]>({
    queryKey: ['client-work-orders'],
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
        .eq('client_id', clientData.id)
        .order('start_time', { ascending: true })

      if (error) throw error
      return data
    }
  })

  const groupedWorkOrders = workOrders?.reduce((acc, order) => {
    const date = format(new Date(order.start_time), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(order)
    return acc
  }, {} as Record<string, WorkOrder[]>)

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!workOrders?.length) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-4">
          <PageBreadcrumbs />
          <h1 className="text-2xl md:text-3xl font-bold">My Bookings</h1>
        </div>
        <Alert className="mt-6">
          <Calendar className="h-4 w-4" />
          <AlertTitle>No Bookings Found</AlertTitle>
          <AlertDescription>
            You don't have any bookings scheduled at the moment.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <PageBreadcrumbs />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">My Bookings</h1>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All vehicles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vehicles</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-8">
        {Object.entries(groupedWorkOrders || {}).map(([date, orders]) => (
          <div key={date} className="space-y-4">
            <h2 className="text-lg font-semibold">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h2>
            <div className="space-y-4">
              {orders?.map((order) => (
                <Card 
                  key={order.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedBooking(order)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            {order.vehicle_year} {order.vehicle_make} {order.vehicle_model}
                          </h3>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarClock className="h-4 w-4" />
                            <span>
                              {format(new Date(order.start_time), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                        {order.service_bays?.name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>Bay {order.service_bays.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm">
                        {order.status}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BookingDetailsDialog 
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
        booking={selectedBooking}
      />
    </div>
  )
}
