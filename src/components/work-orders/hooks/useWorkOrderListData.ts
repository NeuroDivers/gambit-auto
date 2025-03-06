
import { useState, useEffect } from "react"
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
  const [assignBayWorkOrder, setAssignBayWorkOrder] = useState<WorkOrder | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Set up real-time subscription
  useEffect(() => {
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
          console.log('Work order change detected:', payload)
          queryClient.invalidateQueries({ queryKey: ["workOrders"] })
          
          // Show toast notification based on the type of change
          switch (payload.eventType) {
            case "UPDATE":
              toast.success('Work order updated')
              break
            case "INSERT":
              toast.success('New work order created')
              break
            case "DELETE":
              toast.info('Work order deleted')
              break
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    return () => {
      console.log("Cleaning up subscription")
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const { data: workOrders, isLoading, error } = useQuery({
    queryKey: ["workOrders", searchTerm, statusFilter, assignmentFilter, page],
    queryFn: async () => {
      try {
        console.log("Fetching work orders with filters:", { searchTerm, statusFilter, assignmentFilter });
        
        let query = supabase
          .from("work_orders")
          .select(`
            *,
            service_bays!fk_work_orders_assigned_bay (
              id,
              name
            )
          `, { count: 'exact' })
          .order("created_at", { ascending: false })

        // Handle search term
        if (searchTerm && searchTerm.trim() !== '') {
          query = query.or(
            `first_name.ilike.%${searchTerm.trim()}%,` +
            `last_name.ilike.%${searchTerm.trim()}%,` +
            `email.ilike.%${searchTerm.trim()}%,` +
            `phone_number.ilike.%${searchTerm.trim()}%`
          )
        }

        // Handle status filter - map approved/rejected to our standard statuses if needed
        if (statusFilter !== "all") {
          if (statusFilter === "in_progress") {
            query = query.eq("status", "in_progress");
          } else if (statusFilter === "pending") {
            query = query.or("status.eq.pending,status.eq.approved");
          } else if (statusFilter === "cancelled") {
            query = query.or("status.eq.cancelled,status.eq.rejected");
          } else {
            query = query.eq("status", statusFilter);
          }
        }

        // Handle assignment filter
        if (assignmentFilter === "assigned-bay") {
          query = query.not("assigned_bay_id", "is", null);
        } else if (assignmentFilter === "unassigned-bay") {
          query = query.is("assigned_bay_id", null);
        }

        const { data, error, count } = await query;

        if (error) {
          console.error('Work orders fetch error:', error);
          throw new Error(`Failed to fetch work orders: ${error.message}`);
        }

        // Calculate total pages
        if (count !== null) {
          setTotalPages(Math.ceil(count / 10)); // Assuming 10 items per page
        }

        console.log("Fetched work orders:", data);
        return data || [];
      } catch (err) {
        console.error('Work orders fetch error:', err);
        toast.error('Failed to load work orders');
        throw err;
      }
    }
  });

  const { data: serviceBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("service_bays")
          .select("*")
          .order('name')
      
        if (error) {
          console.error('Service bays fetch error:', error)
          throw new Error(`Failed to fetch service bays: ${error.message}`)
        }

        return data || []
      } catch (err) {
        console.error('Service bays fetch error:', err)
        toast.error('Failed to load service bays')
        throw err
      }
    }
  })

  const handleAssignBay = async (workOrderId: string, bayId: string | null) => {
    try {
      console.log('Assigning bay:', { workOrderId, bayId })
      
      // First get the current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user found')
      }

      // Update the work order
      const { error: updateError } = await supabase
        .from('work_orders')
        .update({ 
          assigned_bay_id: bayId === "unassigned" ? null : bayId,
          updated_at: new Date().toISOString(),
          assigned_profile_id: user.id // Add the current user as the one making the change
        })
        .eq("id", workOrderId)

      if (updateError) {
        console.error('Bay assignment error:', updateError)
        throw updateError
      }

      // Fetch the updated work order to get the latest state
      const { data: updatedWorkOrder, error: fetchError } = await supabase
        .from('work_orders')
        .select(`
          *,
          service_bays!fk_work_orders_assigned_bay (
            id,
            name
          )
        `)
        .eq('id', workOrderId)
        .single()

      if (fetchError) {
        console.error('Error fetching updated work order:', fetchError)
        throw fetchError
      }

      console.log('Updated work order:', updatedWorkOrder)
      
      // Invalidate the queries to refetch the latest data
      await queryClient.invalidateQueries({ queryKey: ["workOrders"] })
      await queryClient.invalidateQueries({ queryKey: ["service-bays"] })
      
      toast.success('Bay assigned successfully')
      
      // Clear the assignment modal state
      setAssignBayWorkOrder(null)
    } catch (err) {
      console.error('Bay assignment error:', err)
      toast.error('Failed to assign bay')
      throw err
    }
  }

  const handleCreateInvoice = async (workOrderId: string) => {
    // Logic to create an invoice
  }

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    assignmentFilter,
    setAssignmentFilter,
    selectedWorkOrder,
    setSelectedWorkOrder,
    assignBayWorkOrder,
    setAssignBayWorkOrder,
    workOrders,
    isLoading,
    error,
    serviceBays,
    handleAssignBay,
    handleCreateInvoice,
    page,
    setPage,
    totalPages
  }
}
