
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Permission } from "../types/permissions"

export const useRolePermissions = (roleId: string | null) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isUpdating, setIsUpdating] = useState(false)

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async () => {
      if (!roleId) return null
      
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role_id", roleId)
        .order("resource_name")
      
      if (error) throw error
      
      return data as Permission[]
    },
    enabled: !!roleId,
  })

  const { data: role } = useQuery({
    queryKey: ["role", roleId],
    queryFn: async () => {
      if (!roleId) return null
      
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("id", roleId)
        .maybeSingle()
      
      if (error) throw error
      return data
    },
    enabled: !!roleId,
  })

  const handlePermissionToggle = async (permission: Permission, newValue: boolean) => {
    if (isUpdating) return
    
    setIsUpdating(true)
    
    try {
      queryClient.setQueryData(["role-permissions", roleId], (oldData: Permission[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(p => p.id === permission.id ? { ...p, is_active: newValue } : p)
      })

      const { error: updateError } = await supabase
        .from("role_permissions")
        .update({ 
          is_active: newValue,
          updated_at: new Date().toISOString()
        })
        .eq("id", permission.id)

      if (updateError) throw updateError

      const resourceName = permission.resource_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      const permissionType = permission.permission_type.toLowerCase().replace(/_/g, ' ')
      const action = newValue ? "enabled" : "disabled"
      
      toast({
        title: `Permission ${action}`,
        description: `${resourceName} permission has been ${action} for ${permissionType} operations.`,
      })

    } catch (error: any) {
      console.error("Permission update error:", error)
      
      queryClient.invalidateQueries({ 
        queryKey: ["role-permissions", roleId]
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
      
      queryClient.invalidateQueries({ 
        queryKey: ["role", roleId]
      })
      
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
    isLoading,
    isUpdating,
    role,
    handlePermissionToggle,
    handleDashboardChange
  }
}
