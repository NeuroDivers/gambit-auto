
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export default function EditWorkOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Validate UUID format
  const isValidUUID = (uuid: string | undefined): boolean => {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["workOrder", id],
    queryFn: async () => {
      if (!isValidUUID(id)) {
        throw new Error("Invalid work order ID");
      }

      // First fetch work order details
      const { data: workOrderData, error: workOrderError } = await supabase
        .from("work_orders")
        .select("*")
        .eq("id", id)
        .single();

      if (workOrderError) {
        console.error("Error fetching work order:", workOrderError);
        throw workOrderError;
      }

      if (!workOrderData) {
        throw new Error("Work order not found");
      }

      // Then fetch associated services with explicit relationship
      const { data: servicesData, error: servicesError } = await supabase
        .from("work_order_services")
        .select(`
          id,
          service_id,
          quantity,
          unit_price,
          service:service_types!work_order_services_service_id_fkey (
            id,
            name
          )
        `)
        .eq("work_order_id", id);

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
        throw servicesError;
      }

      return {
        ...workOrderData,
        work_order_services: servicesData
      };
    },
    enabled: isValidUUID(id),
    retry: false,
    onError: (error: Error) => {
      console.error("Error in work order query:", error);
      toast.error(error.message);
      navigate("/work-orders");
    }
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

  const handleSuccess = () => {
    setTimeout(() => {
      navigate("/work-orders");
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-6">
        <div className="px-6">
          <PageBreadcrumbs />
          <div className="mb-4">
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
        <div id="radix-portal-container" />
        <ScrollArea className="h-[calc(100vh-8rem)] px-6">
          <div className="max-w-4xl mx-auto">
            <WorkOrderForm
              workOrder={workOrder}
              onSuccess={handleSuccess}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
