import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderCard } from "@/components/work-orders/WorkOrderCard";
import { Button } from "@/components/ui/button";
import { PlusIcon, CalendarIcon, ListIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isToday, isTomorrow, addDays, startOfDay, endOfDay } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder } from "@/components/work-orders/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WorkOrderStatusBadge } from "@/components/work-orders/WorkOrderStatusBadge";
import { WorkOrderDrawer } from "@/components/work-orders/WorkOrderDrawer";

export function WorkOrdersSection() {
  const navigate = useNavigate();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"today" | "tomorrow" | "upcoming">("today");

  // Format date for API calls
  const formatDate = (date: Date): string => {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
  };

  const { data: workOrders, isLoading, refetch } = useQuery({
    queryKey: ["work-orders", viewMode, formatDate(selectedDate)],
    queryFn: async () => {
      let startDate, endDate;

      if (viewMode === "today") {
        startDate = startOfDay(new Date());
        endDate = endOfDay(new Date());
      } else if (viewMode === "tomorrow") {
        startDate = startOfDay(addDays(new Date(), 1));
        endDate = endOfDay(addDays(new Date(), 1));
      } else {
        // Upcoming: next 7 days excluding today and tomorrow
        startDate = startOfDay(addDays(new Date(), 2));
        endDate = endOfDay(addDays(new Date(), 7));
      }

      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .gte("start_time", formatDate(startDate))
        .lte("start_time", formatDate(endDate))
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching work orders:", error);
        throw error;
      }

      return data || [];
    },
  });

  const handleOpenWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedWorkOrder(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getDateLabel = () => {
    if (viewMode === "today") return "Today";
    if (viewMode === "tomorrow") return "Tomorrow";
    return "Upcoming (Next 7 Days)";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Work Orders</h2>
          <p className="text-muted-foreground">
            View and manage scheduled work orders
          </p>
        </div>
        <Button onClick={() => navigate("/work-orders/new")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Work Order
        </Button>
      </div>

      <Tabs defaultValue="today" className="w-full" onValueChange={(value) => setViewMode(value as any)}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="today" className="relative">
              Today
              {workOrders?.filter(wo => isToday(parseISO(wo.start_time!))).length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {workOrders?.filter(wo => isToday(parseISO(wo.start_time!))).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tomorrow">
              Tomorrow
              {workOrders?.filter(wo => isTomorrow(parseISO(wo.start_time!))).length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {workOrders?.filter(wo => isTomorrow(parseISO(wo.start_time!))).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/calendar")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar View
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/work-orders")}>
              <ListIcon className="mr-2 h-4 w-4" />
              List View
            </Button>
          </div>
        </div>

        <TabsContent value="today" className="mt-0">
          <WorkOrdersList 
            workOrders={workOrders || []} 
            isLoading={isLoading} 
            onOpenWorkOrder={handleOpenWorkOrder}
            dateLabel="Today's Work Orders"
            viewMode="today"
          />
        </TabsContent>
        
        <TabsContent value="tomorrow" className="mt-0">
          <WorkOrdersList 
            workOrders={workOrders || []} 
            isLoading={isLoading} 
            onOpenWorkOrder={handleOpenWorkOrder}
            dateLabel="Tomorrow's Work Orders"
            viewMode="tomorrow"
          />
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-0">
          <WorkOrdersList 
            workOrders={workOrders || []} 
            isLoading={isLoading} 
            onOpenWorkOrder={handleOpenWorkOrder}
            dateLabel="Upcoming Work Orders"
            viewMode="upcoming"
          />
        </TabsContent>
      </Tabs>

      {selectedWorkOrder && (
        <WorkOrderDrawer
          workOrder={selectedWorkOrder}
          open={isDrawerOpen}
          onClose={handleCloseDrawer}
          onUpdate={handleRefresh}
        />
      )}
    </div>
  );
}

interface WorkOrdersListProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  onOpenWorkOrder: (workOrder: WorkOrder) => void;
  dateLabel: string;
  viewMode: "today" | "tomorrow" | "upcoming";
}

function WorkOrdersList({ workOrders, isLoading, onOpenWorkOrder, dateLabel, viewMode }: WorkOrdersListProps) {
  const filteredWorkOrders = workOrders.filter(wo => {
    if (!wo.start_time) return false;
    
    const woDate = parseISO(wo.start_time);
    
    if (viewMode === "today") return isToday(woDate);
    if (viewMode === "tomorrow") return isTomorrow(woDate);
    
    // Upcoming: between day after tomorrow and 7 days from now
    const dayAfterTomorrow = startOfDay(addDays(new Date(), 2));
    const sevenDaysFromNow = endOfDay(addDays(new Date(), 7));
    return woDate >= dayAfterTomorrow && woDate <= sevenDaysFromNow;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (filteredWorkOrders.length === 0) {
    return (
      <EmptyState
        title={`No ${viewMode === "today" ? "Today's" : viewMode === "tomorrow" ? "Tomorrow's" : "Upcoming"} Work Orders`}
        description={`There are no work orders scheduled for ${viewMode === "today" ? "today" : viewMode === "tomorrow" ? "tomorrow" : "the upcoming days"}.`}
        icon={<CalendarIcon className="h-10 w-10" />}
        action={
          <Button onClick={() => navigate("/work-orders/new")}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Schedule Work Order
          </Button>
        }
      />
    );
  }

  // Group work orders by date for the upcoming view
  const groupedWorkOrders = filteredWorkOrders.reduce((acc, workOrder) => {
    if (!workOrder.start_time) return acc;
    
    const dateKey = format(parseISO(workOrder.start_time), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(workOrder);
    return acc;
  }, {} as Record<string, WorkOrder[]>);

  return (
    <div className="space-y-4">
      {viewMode === "upcoming" ? (
        // Render grouped by date for upcoming
        Object.entries(groupedWorkOrders).map(([dateKey, orders]) => (
          <Card key={dateKey} className="overflow-hidden">
            <CardHeader className="bg-muted/50 py-3">
              <CardTitle className="text-lg font-medium">
                {format(parseISO(dateKey), "EEEE, MMMM d")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {orders.map((workOrder) => (
                  <WorkOrderItem 
                    key={workOrder.id} 
                    workOrder={workOrder} 
                    onClick={() => onOpenWorkOrder(workOrder)} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        // Render flat list for today/tomorrow
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 py-3">
            <CardTitle className="text-lg font-medium">{dateLabel}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredWorkOrders.map((workOrder) => (
                <WorkOrderItem 
                  key={workOrder.id} 
                  workOrder={workOrder} 
                  onClick={() => onOpenWorkOrder(workOrder)} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface WorkOrderItemProps {
  workOrder: WorkOrder;
  onClick: () => void;
}

function WorkOrderItem({ workOrder, onClick }: WorkOrderItemProps) {
  return (
    <div 
      className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">
            {workOrder.customer_first_name} {workOrder.customer_last_name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
          </p>
        </div>
        <WorkOrderStatusBadge status={workOrder.status} />
      </div>
      
      <div className="flex items-center gap-4 mt-3 text-sm">
        {workOrder.start_time && (
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{format(parseISO(workOrder.start_time), "h:mm a")}</span>
            {workOrder.end_time && (
              <span>- {format(parseISO(workOrder.end_time), "h:mm a")}</span>
            )}
          </div>
        )}
        
        {workOrder.service_bays && (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="font-normal">
              Bay: {workOrder.service_bays.name}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
