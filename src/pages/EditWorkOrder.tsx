import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EditWorkOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["workOrder", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-destructive">Work order not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <PageBreadcrumbs />
          <div className="mb-6">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => navigate("/work-orders")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Work Orders
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)] px-6">
          <div className="max-w-4xl mx-auto">
            <WorkOrderForm
              workOrder={workOrder}
              onSuccess={() => navigate("/work-orders")}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}