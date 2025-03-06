
import { useRef } from "react";
import { WorkOrder } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HorizontalWorkOrderQueueProps {
  workOrders: WorkOrder[];
  onSelectWorkOrder: (workOrder: WorkOrder) => void;
}

export function HorizontalWorkOrderQueue({ 
  workOrders, 
  onSelectWorkOrder 
}: HorizontalWorkOrderQueueProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (workOrders.length === 0) {
    return (
      <Card className="w-full bg-muted/20">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <CalendarClock className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No approved work orders waiting to be scheduled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full">
      <h3 className="font-medium text-base mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-amber-500" /> 
        Approved Work Orders Ready For Scheduling
      </h3>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4" ref={scrollRef}>
          {workOrders.map((workOrder) => (
            <Card
              key={workOrder.id}
              className="min-w-[280px] max-w-[300px] group hover:border-primary transition-all"
            >
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {workOrder.customer_first_name} {workOrder.customer_last_name}
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                      {workOrder.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
                  </div>
                  
                  {workOrder.additional_notes && (
                    <div className="text-sm line-clamp-2 text-muted-foreground bg-muted/30 p-2 rounded">
                      {workOrder.additional_notes}
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => onSelectWorkOrder(workOrder)}
                  >
                    Schedule <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
