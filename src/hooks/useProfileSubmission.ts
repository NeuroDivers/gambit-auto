
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { ProfileFormValues } from "@/components/profile/schemas/profileFormSchema"
import { toast } from "sonner"

export function useProfileSubmission(isCustomer: boolean) {
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  
  return { onSubmit, isSubmitting }
}
