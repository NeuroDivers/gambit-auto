
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
  const [sortOrder, setSortOrder] = useState("newest");
  const [assignBayWorkOrder, setAssignBayWorkOrder] = useState<WorkOrder | null>(null);
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
      );

    // Apply search filter if provided
    if (debouncedSearchTerm) {
      query = query.or(
        `customer_first_name.ilike.%${debouncedSearchTerm}%,` +
        `customer_last_name.ilike.%${debouncedSearchTerm}%,` +
        `customer_email.ilike.%${debouncedSearchTerm}%,` +
        `customer_phone.ilike.%${debouncedSearchTerm}%,` +
        `customer_vehicle_make.ilike.%${debouncedSearchTerm}%,` +
        `customer_vehicle_model.ilike.%${debouncedSearchTerm}%,` +
        `customer_vehicle_year::text.ilike.%${debouncedSearchTerm}%,` +
        `customer_vehicle_vin.ilike.%${debouncedSearchTerm}%,` +
        `customer_vehicle_license_plate.ilike.%${debouncedSearchTerm}%`
      );
    }

    // Apply status filter if selected
    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    // Apply service bay filter if selected
    if (assignmentFilter === "unassigned") {
      query = query.is("assigned_bay_id", null);
    } else if (assignmentFilter && assignmentFilter !== "all") {
      query = query.eq("assigned_bay_id", assignmentFilter);
    }

    // Apply sorting
    switch (sortOrder) {
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "start_asc":
        query = query.order("start_time", { ascending: true });
        break;
      case "start_desc":
        query = query.order("start_time", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      workOrders: data as WorkOrder[],
      totalCount: count || 0,
    };
  }, [debouncedSearchTerm, statusFilter, assignmentFilter, sortOrder, offset, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, statusFilter, assignmentFilter, sortOrder]);

  const {
    data: workOrdersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workOrders", debouncedSearchTerm, statusFilter, assignmentFilter, sortOrder, page],
    queryFn: fetchWorkOrders,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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
    sortOrder,
    setSortOrder,
    assignBayWorkOrder,
    setAssignBayWorkOrder,
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
