
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { ProfileFormValues } from "@/components/profile/schemas/profileFormSchema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileFormSchema } from "@/components/profile/schemas/profileFormSchema"

export function useProfileData(role?: string | null) {
  const [isCustomer, setIsCustomer] = useState(false)
  
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
  
  return { form, isCustomer }
}
