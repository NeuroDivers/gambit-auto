
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { PasswordFormValues } from "@/components/profile/schemas/profileFormSchema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { passwordFormSchema } from "@/components/profile/schemas/profileFormSchema"

export function usePasswordChange() {
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onPasswordSubmit(values: PasswordFormValues) {
    setPasswordError(null)
    setIsUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword
      })

      if (error) throw error

      toast.success("Password updated successfully")
      passwordForm.reset()
    } catch (error: any) {
      console.error('Error updating password:', error)
      setPasswordError(error.message)
      toast.error("Failed to update password")
    } finally {
      setIsUpdatingPassword(false)
    }
  }
  
  return { 
    passwordForm, 
    onPasswordSubmit, 
    isUpdatingPassword, 
    passwordError 
  }
}
