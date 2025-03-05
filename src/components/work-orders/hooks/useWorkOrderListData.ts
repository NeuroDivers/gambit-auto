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
        let query = supabase
          .from("work_orders")
          .select(`
            *,
            service_bays!fk_work_orders_assigned_bay (
              id,
              name
            )
          `)
          .order("created_at", { ascending: false })

        if (searchTerm) {
          query = query.or(
            `first_name.ilike.%${searchTerm}%,` +
            `last_name.ilike.%${searchTerm}%,` +
            `email.ilike.%${searchTerm}%,` +
            `phone_number.ilike.%${searchTerm}%`
          )
        }

        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter)
        }

        if (assignmentFilter === "assigned") {
          query = query.not("assigned_bay_id", "is", null)
        } else if (assignmentFilter === "unassigned") {
          query = query.is("assigned_bay_id", null)
        }

        const { data, error } = await query

        if (error) {
          console.error('Work orders fetch error:', error)
          throw new Error(`Failed to fetch work orders: ${error.message}`)
        }

        return data || []
      } catch (err) {
        console.error('Work orders fetch error:', err)
        toast.error('Failed to load work orders')
        throw err
      }
    }
  })

  const { data: serviceBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("service_bays")
          .select("*")
          .eq("status", "available")
      
        if (error) {
          console.error('Service bays fetch error:', error)
          throw new Error(`Failed to fetch service bays: ${error.message}`)
        }

        return data.sort((a, b) => {
          const aNumMatch = a.name.match(/^(\d+)/);
          const bNumMatch = b.name.match(/^(\d+)/);
          
          if (aNumMatch && bNumMatch) {
            const aNum = parseInt(aNumMatch[0], 10);
            const bNum = parseInt(bNumMatch[0], 10);
            return aNum - bNum;
          }
          
          if (aNumMatch && !bNumMatch) return -1;
          if (!aNumMatch && bNumMatch) return 1;
          
          return a.name.localeCompare(b.name);
        });
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
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user found')
      }

      const { error: updateError } = await supabase
        .from('work_orders')
        .update({ 
          assigned_bay_id: bayId === "unassigned" ? null : bayId,
          updated_at: new Date().toISOString(),
          assigned_profile_id: user.id
        })
        .eq("id", workOrderId)

      if (updateError) {
        console.error('Bay assignment error:', updateError)
        throw updateError
      }

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
      
      await queryClient.invalidateQueries({ queryKey: ["workOrders"] })
      await queryClient.invalidateQueries({ queryKey: ["service-bays"] })
      
      toast.success('Bay assigned successfully')
      
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
