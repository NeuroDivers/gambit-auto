
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { roleFormSchema, RoleFormValues } from "./RoleFormSchema"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

interface UseRoleFormProps {
  role?: {
    id: string
    name: string
    nicename: string
    description: string | null
    can_be_assigned_to_bay: boolean
    default_dashboard: "admin" | "staff" | "client"
  } | null
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
      can_be_assigned_to_bay: false,
      default_dashboard: "client"
    }
  })

  // Reset form with role data when role changes
  useEffect(() => {
    if (role) {
      console.log("Resetting form with role:", role)
      form.reset({
        name: role.name,
        nicename: role.nicename,
        description: role.description || "",
        can_be_assigned_to_bay: role.can_be_assigned_to_bay,
        default_dashboard: role.default_dashboard
      })
    } else {
      form.reset({
        name: "",
        nicename: "",
        description: "",
        can_be_assigned_to_bay: false,
        default_dashboard: "client"
      })
    }
  }, [role, form])

  const onSubmit = async (values: RoleFormValues) => {
    try {
      if (role) {
        const { error } = await supabase
          .from("roles")
          .update({
            name: values.name,
            nicename: values.nicename,
            description: values.description,
            can_be_assigned_to_bay: values.can_be_assigned_to_bay,
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
            can_be_assigned_to_bay: values.can_be_assigned_to_bay,
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
  }

  return {
    form,
    onSubmit
  }
}
