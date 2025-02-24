
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { roleFormSchema, RoleFormValues } from "./RoleFormSchema"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useCallback, useEffect } from "react"
import { Role } from "../types/role"

interface UseRoleFormProps {
  role?: Role | null
  onSuccess?: () => void
  onOpenChange: (open: boolean) => void
}

export const useRoleForm = ({ role, onSuccess, onOpenChange }: UseRoleFormProps) => {
  const { toast } = useToast()

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      nicename: "",
      description: "",
      default_dashboard: "client"
    }
  })

  // Reset form when role changes
  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        nicename: role.nicename,
        description: role.description ?? "",
        default_dashboard: role.default_dashboard
      })
    } else {
      form.reset({
        name: "",
        nicename: "",
        description: "",
        default_dashboard: "client"
      })
    }
  }, [role, form])

  const onSubmit = useCallback(async (values: RoleFormValues) => {
    try {
      if (role) {
        const { error } = await supabase
          .from("roles")
          .update({
            name: values.name,
            nicename: values.nicename,
            description: values.description,
            default_dashboard: values.default_dashboard,
            updated_at: new Date().toISOString()
          })
          .eq("id", role.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("roles")
          .insert({
            name: values.name,
            nicename: values.nicename,
            description: values.description,
            default_dashboard: values.default_dashboard
          })

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Role ${role ? "updated" : "created"} successfully`
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }, [role, onSuccess, onOpenChange, toast])

  return {
    form,
    onSubmit
  }
}
