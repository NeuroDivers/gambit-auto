
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WorkOrderStatusBadge } from "@/components/work-orders/WorkOrderStatusBadge";
import { format } from "date-fns";
import { ArrowLeft, FileEdit, Wrench, Receipt, User } from "lucide-react";
import { WorkOrder } from "@/components/work-orders/types";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { useWorkOrderInvoice } from "@/components/work-orders/hooks/useWorkOrderInvoice";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function WorkOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const { createInvoice } = useWorkOrderInvoice();

  const { data, isLoading, error } = useQuery({
    queryKey: ["workOrder", id],
    queryFn: async () => {
      if (!id) return null;

      try {
        const { data: workOrderData, error: workOrderError } = await supabase
          .from("work_orders")
          .select(`
            *,
            service_bays!fk_work_orders_assigned_bay (
              id,
              name
            ),
            profiles (
              id,
              first_name,
              last_name
            )
          `)
          .eq("id", id)
          .single();

        if (workOrderError) {
          console.error("Error fetching work order:", workOrderError);
          throw workOrderError;
        }

        const { data: servicesData, error: servicesError } = await supabase
          .from("work_order_services")
          .select(`
            id,
            service_id,
            quantity,
            unit_price,
            commission_rate,
            commission_type,
            assigned_profile_id,
            service_types!work_order_services_service_id_fkey (
              id,
              name,
              description,
              base_price
            )
          `)
          .eq("work_order_id", id);

        if (servicesError) {
          console.error("Error fetching work order services:", servicesError);
          throw servicesError;
        }

        const servicesWithProfiles = await Promise.all(
          servicesData.map(async (service) => {
            if (service.assigned_profile_id) {
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("id, first_name, last_name")
                .eq("id", service.assigned_profile_id)
                .maybeSingle();

              if (profileError) {
                console.error("Error fetching profile for service:", profileError);
                return service;
              }

              return { ...service, profiles: profileData };
            }
            return service;
          })
        );

        return {
          ...workOrderData,
          work_order_services: servicesWithProfiles
        } as WorkOrder;
        
      } catch (error) {
        console.error("Error in work order query:", error);
        throw error;
      }
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      setWorkOrder(data);
    }
  }, [data]);

  useEffect(() => {
    if (!id) return;
    
    console.log("Setting up realtime subscription for work order:", id);
    
    const channel = supabase
      .channel('work-order-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_orders',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Work order change detected:', payload);
          if (payload.new && typeof payload.new === 'object') {
            setWorkOrder(prevWorkOrder => {
              if (!prevWorkOrder) return payload.new as WorkOrder;
              return { ...prevWorkOrder, ...payload.new };
            });
            
            queryClient.invalidateQueries({ queryKey: ["workOrder", id] });
            
            if (
              payload.old && 
              typeof payload.old === 'object' && 
              typeof payload.new === 'object' && 
              'status' in payload.old && 
              'status' in payload.new && 
              payload.old.status !== payload.new.status
            ) {
              toast.success(`Status updated to ${String(payload.new.status)}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          Error loading work order details. Please try again later.
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    return format(new Date(dateString), "PPP");
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    return format(new Date(timeString), "h:mm a");
  };

  const handleEdit = () => {
    navigate(`/work-orders/${workOrder.id}/edit`);
  };

  const handleCreateInvoice = () => {
    createInvoice(workOrder.id);
  };

  const services = workOrder.work_order_services || [];
  
  const totalCost = services.reduce(
    (sum, service) => sum + (service.quantity * service.unit_price), 
    0
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageBreadcrumbs />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2 pl-0 -ml-2" 
            onClick={() => navigate('/work-orders')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Orders
          </Button>
          
          <h1 className="text-2xl font-bold flex flex-wrap items-center gap-3">
            Work Order #{workOrder.id.substring(0, 8)}
            <WorkOrderStatusBadge 
              status={workOrder.status} 
              workOrderId={workOrder.id} 
              editable={true} 
            />
          </h1>
          
          <p className="text-muted-foreground">
            Created on {formatDate(workOrder.created_at)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleEdit}
          >
            <FileEdit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/work-orders?assignBay=${workOrder.id}`)}
          >
            <Wrench className="mr-2 h-4 w-4" />
            Assign Bay
          </Button>
          <Button
            onClick={handleCreateInvoice}
            disabled={workOrder.status !== "completed"}
          >
            <Receipt className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Contact</h3>
              <p className="text-sm text-muted-foreground">{workOrder.customer_first_name} {workOrder.customer_last_name}</p>
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p className="text-sm text-muted-foreground">{workOrder.customer_email || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium">Phone</h3>
              <p className="text-sm text-muted-foreground">{workOrder.customer_phone || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium">Preferred Contact Method</h3>
              <p className="text-sm text-muted-foreground">
                {workOrder.contact_preference === "email" ? "Email" : "Phone"}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Vehicle</h3>
              <p className="text-sm text-muted-foreground">
                {workOrder.customer_vehicle_year} {workOrder.customer_vehicle_make} {workOrder.customer_vehicle_model}
              </p>
            </div>
            <div>
              <h3 className="font-medium">VIN</h3>
              <p className="text-sm text-muted-foreground">
                {workOrder.customer_vehicle_vin || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">License Plate</h3>
              <p className="text-sm text-muted-foreground">
                {workOrder.customer_vehicle_license_plate || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Color</h3>
              <p className="text-sm text-muted-foreground">
                {workOrder.customer_vehicle_color || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Assigned Bay</h3>
              <p className="text-sm text-muted-foreground">
                {workOrder.service_bay?.name || "Unassigned"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Scheduled Date</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(workOrder.start_time)}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Appointment Time</h3>
              <p className="text-sm text-muted-foreground">
                {workOrder.start_time && workOrder.end_time
                  ? `${formatTime(workOrder.start_time)} - ${formatTime(workOrder.end_time)}`
                  : "No time specified"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Assigned To</h3>
              <p className="text-sm text-muted-foreground">
                {workOrder.profiles?.first_name && workOrder.profiles?.last_name
                  ? `${workOrder.profiles.first_name} ${workOrder.profiles.last_name}`
                  : "Unassigned"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          {services && services.length > 0 ? (
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={service.id || index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{service.service_types?.name || 'Unknown Service'}</h3>
                      <p className="text-sm text-muted-foreground">{service.service_types?.description || ''}</p>
                      
                      {service.profiles ? (
                        <div className="flex items-center mt-2">
                          <User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs font-normal">
                            {service.profiles.first_name} {service.profiles.last_name}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5 mr-1.5" />
                          <span>Not assigned</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${service.unit_price.toFixed(2)} × {service.quantity}</p>
                      <p className="text-sm">${(service.unit_price * service.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-4">
                <h3 className="font-semibold">Total</h3>
                <p className="font-semibold">${totalCost.toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No services added to this work order.</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {workOrder.additional_notes ? (
            <p className="whitespace-pre-line">{workOrder.additional_notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No additional notes</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
