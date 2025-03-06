
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useState, useEffect } from "react"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { HorizontalCalendar } from "@/components/calendar/HorizontalCalendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { WorkOrder } from "@/components/work-orders/types"
import { CreateWorkOrderDialog } from "@/components/work-orders/CreateWorkOrderDialog"
import { useServiceBays } from "@/components/service-bays/hooks/useServiceBays"

export default function Bookings() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  // Force a refetch of service bays when this component mounts
  const { refetch: refetchServiceBays } = useServiceBays()
  
  useEffect(() => {
    // This will ensure service bays are loaded when the bookings page is visited
    refetchServiceBays().catch(error => {
      console.error("Error refetching service bays:", error);
    });
  }, [refetchServiceBays]);
  
  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ["clientWorkOrders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("You need to be logged in to view your bookings")
        return []
      }
      
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .eq("customer_id", user.id)
        .not("start_time", "is", null)
        .order("start_time", { ascending: true })
      
      if (error) {
        console.error("Error fetching client work orders:", error)
        toast.error("Failed to load your bookings")
        throw error
      }
      
      return data as WorkOrder[]
    }
  })

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setShowCreateDialog(true)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <PageBreadcrumbs />
        <h1 className="text-2xl md:text-3xl font-bold">My Bookings</h1>
      </div>
      
      <Card className="bg-gradient-to-r from-primary/10 to-white">
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarDays className="h-5 w-5 text-primary" />
            Scheduled Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            View your upcoming scheduled services below or click on a date to request a new service.
          </p>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <HorizontalCalendar
          onDateSelect={handleDateSelect}
          workOrders={workOrders}
          className="bg-card"
        />
      )}
      
      <CreateWorkOrderDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
        defaultStartTime={selectedDate || undefined}
      />
    </div>
  )
}
