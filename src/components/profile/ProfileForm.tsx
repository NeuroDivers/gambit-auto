
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { PersonalInfoForm } from "./sections/PersonalInfoForm"
import { PasswordChangeForm } from "./sections/PasswordChangeForm"
import { 
  profileFormSchema, 
  passwordFormSchema,
  type ProfileFormValues,
  type PasswordFormValues
} from "./schemas/profileFormSchema"

interface ProfileFormProps {
  role?: string | null
}

export function ProfileForm({ role }: ProfileFormProps) {
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      address: "",
      bio: "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        form.reset({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone_number: profile.phone_number || "",
          address: profile.address || "",
          bio: profile.bio || "",
        })
      }
    }

    loadProfile()
  }, [form])

  async function onSubmit(values: ProfileFormValues) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          phone_number: values.phone_number,
          address: values.address,
          bio: values.bio,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error("There was an error updating your profile")
    }
  }

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

  return (
    <div className="space-y-12">
      <PersonalInfoForm 
        form={form} 
        onSubmit={onSubmit}
        role={role}
      />

      <Separator />

      <PasswordChangeForm 
        form={passwordForm}
        onSubmit={onPasswordSubmit}
        isUpdating={isUpdatingPassword}
        error={passwordError}
      />
    </div>
  )
}
