
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "../types";
import { toast } from "sonner";
import { useWorkOrderInvoice } from "./useWorkOrderInvoice";

export function useWorkOrderListData() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");
  const [assignBayWorkOrder, setAssignBayWorkOrder] = useState<WorkOrder | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { createInvoice } = useWorkOrderInvoice();
  
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  // Fetch work orders with pagination
  const {
    data: workOrdersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workOrders", searchTerm, statusFilter, assignmentFilter, page],
    queryFn: async () => {
      let query = supabase
        .from("work_orders")
        .select(
          `
          *,
          service_bays!fk_work_orders_assigned_bay (
            id,
            name
          )
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      // Apply filters
      if (searchTerm) {
        query = query.or(
          `customer_first_name.ilike.%${searchTerm}%,customer_last_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,customer_vehicle_make.ilike.%${searchTerm}%,customer_vehicle_model.ilike.%${searchTerm}%,customer_vehicle_vin.ilike.%${searchTerm}%`
        );
      }

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      if (assignmentFilter === "assigned") {
        query = query.not("assigned_bay_id", "is", null);
      } else if (assignmentFilter === "unassigned") {
        query = query.is("assigned_bay_id", null);
      } else if (assignmentFilter && assignmentFilter !== "all") {
        // If it's not "all", "assigned", or "unassigned", it's a specific bay id
        query = query.eq("assigned_bay_id", assignmentFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        workOrders: data as WorkOrder[],
        totalCount: count || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch service bays
  const { data: serviceBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .eq("status", "available")
        .order("name");

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Mutation to assign a bay
  const assignBayMutation = useMutation({
    mutationFn: async ({
      workOrderId,
      bayId,
    }: {
      workOrderId: string;
      bayId: string | null;
    }) => {
      const { error } = await supabase
        .from("work_orders")
        .update({
          assigned_bay_id: bayId,
        })
        .eq("id", workOrderId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Bay assignment updated");
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    },
    onError: () => {
      toast.error("Failed to update bay assignment");
    },
  });

  // Handler for bay assignment
  const handleAssignBay = (workOrderId: string, bayId: string | null) => {
    assignBayMutation.mutate({ workOrderId, bayId });
    setAssignBayWorkOrder(null);
  };

  // Handler for creating an invoice
  const handleCreateInvoice = (workOrderId: string) => {
    createInvoice(workOrderId);
  };

  const totalPages = Math.ceil(
    (workOrdersData?.totalCount || 0) / pageSize
  );

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    assignmentFilter,
    setAssignmentFilter,
    assignBayWorkOrder,
    setAssignBayWorkOrder,
    selectedWorkOrder,
    setSelectedWorkOrder,
    workOrders: workOrdersData?.workOrders || [],
    isLoading,
    error,
    serviceBays,
    handleAssignBay,
    handleCreateInvoice,
    page,
    setPage,
    totalPages,
  };
}
