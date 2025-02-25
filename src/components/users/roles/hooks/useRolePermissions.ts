
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Permission } from "../types/permissions"

export const useRolePermissions = (roleId: string | null) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isUpdating, setIsUpdating] = useState(false)

  const { data: role, isLoading: isRoleLoading } = useQuery({
    queryKey: ["role", roleId],
    queryFn: async () => {
      if (!roleId) {
        console.log("No roleId provided for role fetch")
        return null
      }
      
      console.log("Fetching role:", roleId)
      
      const { data, error } = await supabase
        .from("roles")
        .select(`
          id,
          name,
          nicename,
          description,
          can_be_assigned_to_bay,
          can_be_assigned_work_orders,
          default_dashboard
        `)
        .eq("id", roleId)
        .maybeSingle()
      
      if (error) {
        console.error("Error fetching role:", error)
        toast({
          title: "Error fetching role",
          description: error.message,
          variant: "destructive",
        })
        return null
      }

      console.log("Fetched role:", data)
      return data
    },
    enabled: !!roleId,
  })

  const { data: permissions, isLoading: isPermissionsLoading } = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async () => {
      if (!roleId) {
        console.log("No roleId provided for permissions fetch")
        return null
      }
      
      console.log("Fetching permissions for role:", roleId)
      
      const { data, error } = await supabase
        .from("role_permissions")
        .select(`
          id,
          role_id,
          resource_name,
          permission_type,
          is_active,
          description
        `)
        .eq("role_id", roleId)
        .order("resource_name")
      
      if (error) {
        console.error("Error fetching permissions:", error)
        toast({
          title: "Error fetching permissions",
          description: error.message,
          variant: "destructive",
        })
        return []
      }
      
      if (!data || data.length === 0) {
        console.log("No permissions found for role:", roleId)
      } else {
        console.log("Fetched permissions:", data)
      }
      
      return data as Permission[]
    },
    enabled: !!roleId,
  })

  const handlePermissionToggle = async (permission: Permission, newValue: boolean) => {
    if (!roleId || isUpdating) {
      console.log("Toggle blocked:", !roleId ? "No roleId" : "Already updating")
      return
    }
    
    setIsUpdating(true)
    console.log("Updating permission:", { id: permission.id, newValue })
    
    try {
      // Optimistically update the cache
      queryClient.setQueryData(["role-permissions", roleId], (oldData: Permission[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(p => 
          p.id === permission.id ? { ...p, is_active: newValue } : p
        )
      })

      const { error } = await supabase
        .from("role_permissions")
        .update({ 
          is_active: newValue,
          updated_at: new Date().toISOString()
        })
        .eq("id", permission.id)

      if (error) throw error

      // Refresh the data
      await queryClient.invalidateQueries({
        queryKey: ["role-permissions", roleId]
      })

      const resourceName = permission.resource_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      const permissionType = permission.permission_type.toLowerCase().replace(/_/g, ' ')
      
      toast({
        title: "Permission updated",
        description: `${resourceName} ${permissionType} has been ${newValue ? 'enabled' : 'disabled'}.`,
        duration: 3000,
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
        duration: 3000,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBayAssignmentToggle = async (newValue: boolean) => {
    if (!roleId || isUpdating || !role) {
      console.log("Bay toggle blocked:", { noRoleId: !roleId, isUpdating, noRole: !role })
      return
    }
    
    setIsUpdating(true)
    console.log("Updating bay assignment:", { roleId, newValue })

    try {
      // Optimistically update the cache
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

      await queryClient.invalidateQueries({ queryKey: ["role", roleId] })

      toast({
        title: "Role updated",
        description: `Bay assignment ${newValue ? 'enabled' : 'disabled'} for this role.`,
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Bay assignment update error:", error)
      queryClient.invalidateQueries({ queryKey: ["role", roleId] })
      toast({
        title: "Error updating bay assignment",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleWorkOrderAssignmentToggle = async (newValue: boolean) => {
    if (!roleId || isUpdating || !role) {
      console.log("Work order toggle blocked:", { noRoleId: !roleId, isUpdating, noRole: !role })
      return
    }
    
    setIsUpdating(true)
    console.log("Updating work order assignment:", { roleId, newValue })

    try {
      // Optimistically update the cache
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

      await queryClient.invalidateQueries({ queryKey: ["role", roleId] })

      toast({
        title: "Role updated",
        description: `Work order assignment ${newValue ? 'enabled' : 'disabled'} for this role.`,
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Work order assignment update error:", error)
      queryClient.invalidateQueries({ queryKey: ["role", roleId] })
      toast({
        title: "Error updating work order assignment",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDashboardChange = async (dashboard: "admin" | "staff" | "client") => {
    if (!roleId || isUpdating || !role) {
      console.log("Dashboard change blocked:", { noRoleId: !roleId, isUpdating, noRole: !role })
      return
    }
    
    setIsUpdating(true)
    console.log("Updating default dashboard:", { roleId, dashboard })

    try {
      // Optimistically update the cache
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

      await queryClient.invalidateQueries({ queryKey: ["role", roleId] })

      toast({
        title: "Default dashboard updated",
        description: `Users with this role will now see the ${dashboard} dashboard by default.`,
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Dashboard update error:", error)
      queryClient.invalidateQueries({ queryKey: ["role", roleId] })
      toast({
        title: "Error updating default dashboard",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    permissions,
    isLoading: isRoleLoading || isPermissionsLoading,
    isUpdating,
    role,
    handlePermissionToggle,
    handleDashboardChange,
    handleBayAssignmentToggle,
    handleWorkOrderAssignmentToggle
  }
}
