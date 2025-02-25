import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Permission } from "../types/permissions"

export const useRolePermissions = (roleId: string | null) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isUpdating, setIsUpdating] = useState(false)

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async () => {
      if (!roleId) return null
      
      console.log("Fetching permissions for role:", roleId)
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role_id", roleId)
        .order("resource_name")
      
      if (error) {
        console.error("Error fetching permissions:", error)
        throw error
      }
      
      console.log("Fetched permissions:", data)
      return data as Permission[]
    },
    enabled: !!roleId,
  })

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ["role", roleId],
    queryFn: async () => {
      if (!roleId) return null
      
      console.log("Fetching role:", roleId)
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("id", roleId)
        .maybeSingle()
      
      if (error) {
        console.error("Error fetching role:", error)
        throw error
      }
      
      console.log("Fetched role:", data)
      return data
    },
    enabled: !!roleId,
  })

  const handlePermissionToggle = async (permission: Permission, newValue: boolean) => {
    if (!roleId || isUpdating) return
    
    setIsUpdating(true)
    console.log("Updating permission:", permission.id, "to:", newValue)
    
    try {
      // Optimistically update the cache
      queryClient.setQueryData(["role-permissions", roleId], (oldData: Permission[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(p => 
          p.id === permission.id ? { ...p, is_active: newValue } : p
        )
      })

      // Update the database
      const { data, error } = await supabase
        .from("role_permissions")
        .update({
          is_active: newValue,
        })
        .eq("id", permission.id)
        .select("*")

      if (error) {
        console.error("Database update error:", error)
        throw error
      }

      console.log("Update response:", data)

      // Refresh the data to ensure we have the latest state
      await queryClient.invalidateQueries({
        queryKey: ["role-permissions", roleId]
      })

      const resourceName = permission.resource_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      const permissionType = permission.permission_type.toLowerCase().replace(/_/g, ' ')
      
      toast({
        title: "Permission updated",
        description: `${resourceName} ${permissionType} has been ${newValue ? 'enabled' : 'disabled'}.`,
      })

    } catch (error: any) {
      console.error("Permission update error:", error)
      
      // Revert the optimistic update
      queryClient.setQueryData(["role-permissions", roleId], (oldData: Permission[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(p => 
          p.id === permission.id ? { ...p, is_active: !newValue } : p
        )
      })
      
      toast({
        title: "Error updating permission",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBayAssignmentToggle = async (newValue: boolean) => {
    if (!roleId || isUpdating) return
    setIsUpdating(true)

    try {
      queryClient.setQueryData(["role", roleId], (oldData: any) => {
        if (!oldData) return oldData
        return { ...oldData, can_be_assigned_to_bay: newValue }
      })

      const { error } = await supabase
        .from("roles")
        .update({ 
          can_be_assigned_to_bay: newValue,
          updated_at: new Date().toISOString()
        })
        .eq("id", roleId)

      if (error) throw error

      toast({
        title: "Role updated",
        description: `Bay assignment ${newValue ? 'enabled' : 'disabled'} for this role.`,
      })
    } catch (error: any) {
      console.error("Bay assignment update error:", error)
      queryClient.invalidateQueries({ queryKey: ["role", roleId] })
      toast({
        title: "Error updating bay assignment",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleWorkOrderAssignmentToggle = async (newValue: boolean) => {
    if (!roleId || isUpdating) return
    setIsUpdating(true)

    try {
      queryClient.setQueryData(["role", roleId], (oldData: any) => {
        if (!oldData) return oldData
        return { ...oldData, can_be_assigned_work_orders: newValue }
      })

      const { error } = await supabase
        .from("roles")
        .update({ 
          can_be_assigned_work_orders: newValue,
          updated_at: new Date().toISOString()
        })
        .eq("id", roleId)

      if (error) throw error

      toast({
        title: "Role updated",
        description: `Work order assignment ${newValue ? 'enabled' : 'disabled'} for this role.`,
      })
    } catch (error: any) {
      console.error("Work order assignment update error:", error)
      queryClient.invalidateQueries({ queryKey: ["role", roleId] })
      toast({
        title: "Error updating work order assignment",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDashboardChange = async (dashboard: "admin" | "staff" | "client") => {
    if (!roleId || isUpdating) return
    setIsUpdating(true)

    try {
      queryClient.setQueryData(["role", roleId], (oldData: any) => {
        if (!oldData) return oldData
        return { ...oldData, default_dashboard: dashboard }
      })

      const { error } = await supabase
        .from("roles")
        .update({ 
          default_dashboard: dashboard,
          updated_at: new Date().toISOString()
        })
        .eq("id", roleId)

      if (error) throw error

      toast({
        title: "Default dashboard updated",
        description: `Users with this role will now see the ${dashboard} dashboard by default.`,
      })
    } catch (error: any) {
      console.error("Dashboard update error:", error)
      queryClient.invalidateQueries({ queryKey: ["role", roleId] })
      toast({
        title: "Error updating default dashboard",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    permissions,
    isLoading: permissionsLoading || roleLoading,
    isUpdating,
    role,
    handlePermissionToggle,
    handleDashboardChange,
    handleBayAssignmentToggle,
    handleWorkOrderAssignmentToggle
  }
}
