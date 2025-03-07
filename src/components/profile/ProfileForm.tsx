
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
  const [isCustomer, setIsCustomer] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      unit_number: "",
      street_address: "",
      city: "",
      state_province: "",
      postal_code: "",
      country: "",
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

      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Check if user is a customer by role name
      const isCustomerRole = role?.toLowerCase() === 'client' || role?.toLowerCase() === 'customer'
      setIsCustomer(isCustomerRole)

      if (profile) {
        // Start with profile data
        const formData = {
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone_number: profile.phone_number || "",
          bio: profile.bio || "",
          // Address fields will be populated differently based on role
          unit_number: "",
          street_address: "",
          city: "",
          state_province: "",
          postal_code: "",
          country: "",
        }

        // If user is a customer, load address data from customer table
        if (isCustomerRole) {
          const { data: customer } = await supabase
            .from('customers')
            .select('*')
            .eq('profile_id', user.id)
            .single()

          if (customer) {
            // Populate address fields from customer record
            formData.unit_number = customer.customer_unit_number || ""
            formData.street_address = customer.customer_street_address || ""
            formData.city = customer.customer_city || ""
            formData.state_province = customer.customer_state_province || ""
            formData.postal_code = customer.customer_postal_code || ""
            formData.country = customer.customer_country || ""
          }
        } else {
          // For staff and other roles, load address from staff table first
          const { data: staffData } = await supabase
            .from('staff')
            .select('*')
            .eq('profile_id', user.id)
            .single()

          if (staffData) {
            // Use staff address data if it exists
            formData.unit_number = staffData.unit_number || ""
            formData.street_address = staffData.street_address || ""
            formData.city = staffData.city || ""
            formData.state_province = staffData.state_province || ""
            formData.postal_code = staffData.postal_code || ""
            formData.country = staffData.country || ""
          }
        }

        form.reset(formData)
      }
    }

    loadProfile()
  }, [form, role])

  async function onSubmit(values: ProfileFormValues) {
    try {
      setIsSubmitting(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      // Always update basic profile info
      const profileUpdate = {
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        bio: values.bio,
      }

      // Update profile with basic info (not address)
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)

      if (profileError) throw profileError

      // If user is a customer, update address in customers table
      if (isCustomer) {
        // Check if customer record exists first
        const { data: customerData } = await supabase
          .from('customers')
          .select('id')
          .eq('profile_id', user.id)
          .single()
        
        if (customerData) {
          // Update existing customer record
          const { error: customerError } = await supabase
            .from('customers')
            .update({
              customer_unit_number: values.unit_number,
              customer_street_address: values.street_address,
              customer_city: values.city,
              customer_state_province: values.state_province,
              customer_postal_code: values.postal_code,
              customer_country: values.country,
            })
            .eq('profile_id', user.id)

          if (customerError) throw customerError
        } else {
          // Create new customer record if it doesn't exist
          const { error: newCustomerError } = await supabase
            .from('customers')
            .insert({
              profile_id: user.id,
              customer_first_name: values.first_name,
              customer_last_name: values.last_name,
              customer_email: user.email,
              customer_unit_number: values.unit_number,
              customer_street_address: values.street_address,
              customer_city: values.city,
              customer_state_province: values.state_province,
              customer_postal_code: values.postal_code,
              customer_country: values.country,
            })

          if (newCustomerError) throw newCustomerError
        }
      } else {
        // For staff and other roles, update address in staff table if it exists
        const { data: staffData } = await supabase
          .from('staff')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        if (staffData) {
          const { error: staffError } = await supabase
            .from('staff')
            .update({
              unit_number: values.unit_number,
              street_address: values.street_address,
              city: values.city,
              state_province: values.state_province,
              postal_code: values.postal_code,
              country: values.country,
            })
            .eq('profile_id', user.id)

          if (staffError) throw staffError
        }
      }

      toast.success("Profile updated successfully")
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(`Error updating profile: ${error.message}`)
    } finally {
      setIsSubmitting(false)
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
        isSubmitting={isSubmitting}
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
