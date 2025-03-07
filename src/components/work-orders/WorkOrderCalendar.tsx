
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
      // Format date as YYYY-MM-DD for database query
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      console.log("Fetching work orders for date:", formattedDate);

      // First fetch the work orders for the selected date
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
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
          contact_preference
        `)
        .gte("start_time", `${formattedDate}T00:00:00`)
        .lte("start_time", `${formattedDate}T23:59:59`)
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching work orders:", error);
        throw error;
      }
      
      console.log("Work orders fetched:", data);
      
      // If no data, return empty array
      if (!data || data.length === 0) return [];

      // Now fetch the profiles for the work orders that have assigned_profile_id
      const profileIds = data
        .filter(order => order.assigned_profile_id)
        .map(order => order.assigned_profile_id);

      if (profileIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", profileIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          // Continue without profiles rather than failing completely
        }

        // Map profiles to work orders
        const workOrdersWithProfiles = data.map(order => {
          if (!order.assigned_profile_id) {
            return {
              ...order,
              created_at: order.created_at || new Date().toISOString(),
              contact_preference: order.contact_preference || 'email',
              profiles: {
                id: null,
                first_name: null,
                last_name: null
              }
            };
          }

          const profile = profilesData?.find(p => p.id === order.assigned_profile_id);
          return {
            ...order,
            created_at: order.created_at || new Date().toISOString(),
            contact_preference: order.contact_preference || 'email',
            profiles: profile ? {
              id: profile.id,
              first_name: profile.first_name,
              last_name: profile.last_name
            } : {
              id: null,
              first_name: null,
              last_name: null
            }
          };
        });

        return workOrdersWithProfiles as WorkOrder[];
      }

      // If no profiles needed, just transform the data
      return data.map(order => ({
        ...order,
        created_at: order.created_at || new Date().toISOString(),
        contact_preference: order.contact_preference || 'email',
        profiles: {
          id: null,
          first_name: null,
          last_name: null
        }
      })) as WorkOrder[];
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
