
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { WorkOrder } from "../types"
import { toast } from "sonner"

export function useWorkOrderListData() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const [assignWorkOrder, setAssignWorkOrder] = useState<WorkOrder | null>(null)
  const [assignBayWorkOrder, setAssignBayWorkOrder] = useState<WorkOrder | null>(null)

  const { data: workOrders, isLoading, error } = useQuery({
    queryKey: ['work-orders'],
    queryFn: async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkOrder[];
    }
  });

  const { data: assignableUsers } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: async () => {
      const { data: assignableRoles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .eq('can_be_assigned_to_bay', true)

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
    } catch (error) {
      console.error('Error assigning bay:', error);
      toast.error("Failed to assign bay");
    }
  };

  const filteredWorkOrders = workOrders?.filter(order => {
    const matchesSearch = (
      order.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle_make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedWorkOrder,
    setSelectedWorkOrder,
    assignWorkOrder,
    setAssignWorkOrder,
    assignBayWorkOrder,
    setAssignBayWorkOrder,
    workOrders: filteredWorkOrders,
    isLoading,
    error,
    assignableUsers,
    serviceBays,
    handleAssignUser,
    handleAssignBay
  };
}
