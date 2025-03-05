
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { roleFormSchema, RoleFormValues } from "./RoleFormSchema"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useCallback, useEffect } from "react"
import { Role } from "../types/role"

interface UseRoleFormProps {
  role?: Role | null
  onSuccess?: () => void
  onOpenChange: (open: boolean) => void
}

const PROTECTED_ROLE_IDS = [
  '816fe283-1aef-4294-b3cb-264347852e95', // Administrator
  '73a06339-6dd6-4da7-ac27-db9e160c2ff6'  // Client
];

export const useRoleForm = ({ role, onSuccess, onOpenChange }: UseRoleFormProps) => {
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
        const isProtectedRole = PROTECTED_ROLE_IDS.includes(role.id);
        const updateData = {
          nicename: values.nicename,
          description: values.description,
          default_dashboard: values.default_dashboard,
          updated_at: new Date().toISOString()
        };

        // Only include name in update if not a protected role
        if (!isProtectedRole) {
          (updateData as any).name = values.name;
        }

        const { error } = await supabase
          .from("roles")
          .update(updateData)
          .eq("id", role.id)

        if (error) {
          // Handle the specific error from our trigger
          if (error.message.includes('Cannot modify the name of a protected system role')) {
            throw new Error('System role names cannot be modified');
          }
          throw error;
        }
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

      toast(`Role ${role ? "updated" : "created"} successfully`);

      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      toast(`Error: ${error.message}`, { 
        style: { backgroundColor: 'red', color: 'white' }
      });
    }
  }, [role, onSuccess, onOpenChange])

  return {
    form,
    onSubmit
  }
}
