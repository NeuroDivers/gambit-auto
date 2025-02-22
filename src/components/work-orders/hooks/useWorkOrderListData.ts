
import { useState, useEffect, useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { WorkOrder } from "../types"
import { toast } from "sonner"

export function useWorkOrderListData() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all")
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const [assignWorkOrder, setAssignWorkOrder] = useState<WorkOrder | null>(null)
  const [assignBayWorkOrder, setAssignBayWorkOrder] = useState<WorkOrder | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const fetchWorkOrders = useCallback(async () => {
    // First, get total count with filters but no pagination
    const { count } = await supabase
      .from('work_orders')
      .select('*', { count: 'exact', head: true });

    // Then get paginated data
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        service_bays!fk_work_orders_assigned_bay (
          name
        ),
        assigned_to:profiles!assigned_profile_id (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return {
      workOrders: data as WorkOrder[],
      totalCount: count || 0
    };
  }, [page, pageSize]);

  const { data: workOrdersData, isLoading, error } = useQuery({
    queryKey: ['work-orders', page, pageSize],
    queryFn: fetchWorkOrders
  });

  // Set up real-time subscription for all relevant tables
  useEffect(() => {
    console.log("Setting up real-time subscriptions...")
    const channel = supabase
      .channel('work-orders-changes')
      .on(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: 'work_orders'
        },
        (payload) => {
          console.log('Work order updated:', payload)
          queryClient.invalidateQueries({ queryKey: ['work-orders'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile updated:', payload)
          queryClient.invalidateQueries({ queryKey: ['work-orders'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_bays'
        },
        (payload) => {
          console.log('Service bay updated:', payload)
          queryClient.invalidateQueries({ queryKey: ['work-orders'] })
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    return () => {
      console.log("Cleaning up real-time subscriptions...")
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const { data: assignableUsers } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: async () => {
      const { data: assignableRoles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .eq('can_be_assigned_work_orders', true)

      if (rolesError) throw rolesError

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role_id,
          roles (
            id,
            name,
            nicename
          )
        `)
        .in('role_id', assignableRoles.map(role => role.id))

      if (error) throw error
      return profiles
    }
  });

  const { data: serviceBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_bays')
        .select('*')
        .eq('status', 'available')
        .order('name')
      
      if (error) throw error
      return data
    }
  });

  const handleAssignUser = async (userId: string) => {
    if (!assignWorkOrder) return;

    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ assigned_profile_id: userId })
        .eq('id', assignWorkOrder.id);

      if (error) throw error;

      toast.success("User assigned successfully");
      setAssignWorkOrder(null);
      // The real-time subscription will handle the UI update
    } catch (error) {
      console.error('Error assigning user:', error);
      toast.error("Failed to assign user");
    }
  };

  const handleAssignBay = async (bayId: string) => {
    if (!assignBayWorkOrder) return;

    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ assigned_bay_id: bayId })
        .eq('id', assignBayWorkOrder.id);

      if (error) throw error;

      toast.success("Bay assigned successfully");
      setAssignBayWorkOrder(null);
      // The real-time subscription will handle the UI update
    } catch (error) {
      console.error('Error assigning bay:', error);
      toast.error("Failed to assign bay");
    }
  };

  const filteredWorkOrders = workOrdersData?.workOrders.filter(order => {
    const matchesSearch = (
      order.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle_make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    // Add assignment filtering logic
    const matchesAssignment = (() => {
      switch (assignmentFilter) {
        case "unassigned-user":
          return !order.assigned_profile_id;
        case "assigned-user":
          return !!order.assigned_profile_id;
        case "unassigned-bay":
          return !order.assigned_bay_id;
        case "assigned-bay":
          return !!order.assigned_bay_id;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesAssignment;
  });

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    assignmentFilter,
    setAssignmentFilter,
    selectedWorkOrder,
    setSelectedWorkOrder,
    assignWorkOrder,
    setAssignWorkOrder,
    assignBayWorkOrder,
    setAssignBayWorkOrder,
    workOrders: filteredWorkOrders || [],
    isLoading,
    error,
    assignableUsers,
    serviceBays,
    handleAssignUser,
    handleAssignBay,
    page,
    setPage,
    totalPages
  };
}
