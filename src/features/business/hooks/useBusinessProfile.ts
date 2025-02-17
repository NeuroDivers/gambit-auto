
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { UserProfile } from "../schemas/businessFormSchema"

export function useBusinessProfile() {
  return useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      console.log("Fetching business profile...")
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("Not authenticated")
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          role:role_id (
            id,
            name
          )
        `)
        .eq('id', session.user.id)
        .single<UserProfile>()

      if (profileError) {
        console.error("Error fetching user profile:", profileError)
        throw new Error("Failed to verify user role")
      }

      console.log("User profile:", userProfile)
      
      if (!userProfile?.role?.name || userProfile.role.name.toLowerCase() !== 'administrator') {
        throw new Error("Unauthorized - Admin access required")
      }

      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .maybeSingle()

      if (error) {
        console.error("Error fetching business profile:", error)
        throw error
      }
      
      console.log("Business profile data:", data)
      return data || {
        company_name: "",
        email: "",
        phone_number: "",
        address: "",
        logo_url: ""
      }
    }
  })
}
