
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "../types";
import { toast } from "sonner";
import { useWorkOrderInvoice } from "./useWorkOrderInvoice";
import { useDebounce } from "@/hooks/useDebounce";

export function useWorkOrderListData() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");
  const [assignBayWorkOrder, setAssignBayWorkOrder] = useState<WorkOrder | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { createInvoice } = useWorkOrderInvoice();
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  // Memoized query function to prevent unnecessary re-renders
  const fetchWorkOrders = useCallback(async () => {
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

    if (debouncedSearchTerm) {
      query = query.or(
        `customer_first_name.ilike.%${debouncedSearchTerm}%,customer_last_name.ilike.%${debouncedSearchTerm}%,customer_email.ilike.%${debouncedSearchTerm}%,customer_vehicle_make.ilike.%${debouncedSearchTerm}%,customer_vehicle_model.ilike.%${debouncedSearchTerm}%,customer_vehicle_vin.ilike.%${debouncedSearchTerm}%`
      );
    }

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    if (assignmentFilter === "assigned") {
      query = query.not("assigned_bay_id", "is", null);
    } else if (assignmentFilter === "unassigned") {
      query = query.is("assigned_bay_id", null);
    } else if (assignmentFilter && assignmentFilter !== "all") {
      query = query.eq("assigned_bay_id", assignmentFilter);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      workOrders: data as WorkOrder[],
      totalCount: count || 0,
    };
  }, [debouncedSearchTerm, statusFilter, assignmentFilter, offset, pageSize]);

  const {
    data: workOrdersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workOrders", debouncedSearchTerm, statusFilter, assignmentFilter, page],
    queryFn: fetchWorkOrders,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, statusFilter, assignmentFilter]);

  // Memoized service bays query
  const fetchServiceBays = useCallback(async () => {
    const { data, error } = await supabase
      .from("service_bays")
      .select("*")
      .eq("status", "available")
      .order("name");

    if (error) throw error;
    return data;
  }, []);

  const { data: serviceBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: fetchServiceBays,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

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

  const handleAssignBay = useCallback((workOrderId: string, bayId: string | null) => {
    assignBayMutation.mutate({ workOrderId, bayId });
    setAssignBayWorkOrder(null);
  }, [assignBayMutation]);

  const handleCreateInvoice = useCallback((workOrderId: string) => {
    createInvoice(workOrderId);
  }, [createInvoice]);

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
