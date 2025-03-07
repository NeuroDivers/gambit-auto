
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkOrderCard } from "./WorkOrderCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isSameDay } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HorizontalCalendar } from "@/components/calendar/HorizontalCalendar";
import { useIsMobile } from "@/hooks/use-mobile";
import { WorkOrder } from "./types";

export function WorkOrderCalendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const isMobile = useIsMobile();

  const { data: workOrders, isLoading } = useQuery({
    queryKey: ["workOrders", format(currentDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const formattedDate = format(currentDate, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("work_orders")
        .select(
          `
          id, 
          customer_first_name,
          customer_last_name,
          customer_phone,
          customer_email,
          start_time,
          end_time,
          status,
          customer_vehicle_make,
          customer_vehicle_model,
          customer_vehicle_year,
          assigned_profile_id,
          created_at,
          contact_preference,
          timeframe,
          profiles (
            id,
            first_name,
            last_name
          )
        `
        )
        .gte("start_time", `${formattedDate}T00:00:00`)
        .lte("start_time", `${formattedDate}T23:59:59`)
        .order("start_time", { ascending: true });

      if (error) throw error;
      
      // Transform to ensure workOrder has all required fields and correct profiles structure
      const transformedData = data.map(order => {
        // Get the first profile from the array if it exists
        const profileData = order.profiles && order.profiles.length > 0 
          ? order.profiles[0] 
          : { id: null, first_name: null, last_name: null };
          
        return {
          ...order,
          created_at: order.created_at || new Date().toISOString(),
          contact_preference: order.contact_preference || 'email',
          timeframe: order.timeframe || 'flexible',
          // Convert the array of profiles to the single object structure expected by WorkOrder type
          profiles: {
            id: profileData.id,
            first_name: profileData.first_name,
            last_name: profileData.last_name
          }
        };
      }) as WorkOrder[];
      
      return transformedData;
    },
  });

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">
            {isToday(currentDate)
              ? "Today's Schedule"
              : format(currentDate, "MMMM d, yyyy")}
          </h2>
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentDate(new Date())}
          className="hidden md:flex"
        >
          Today
        </Button>
      </div>

      {isMobile ? (
        <HorizontalCalendar
          selectedDate={currentDate}
          onDateSelect={handleDateChange}
        />
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="md:w-80">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>
                Select a date to view work orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={handleDateChange}
              />
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>
                Work Orders for {format(currentDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : workOrders && workOrders.length > 0 ? (
                <ScrollArea className="h-[calc(100vh-24rem)]">
                  <div className="space-y-4 pr-4">
                    {workOrders.map((order) => (
                      <WorkOrderCard key={order.id} workOrder={order} />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No work orders scheduled for this date
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {isMobile && (
        <Card>
          <CardHeader>
            <CardTitle>
              Work Orders for {format(currentDate, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : workOrders && workOrders.length > 0 ? (
              <div className="space-y-4">
                {workOrders.map((order) => (
                  <WorkOrderCard key={order.id} workOrder={order} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No work orders scheduled for this date
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
