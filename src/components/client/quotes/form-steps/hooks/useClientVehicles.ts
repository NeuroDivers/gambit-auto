
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useClientVehicles() {
  return useQuery({
    queryKey: ['client-vehicles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!client) return []

      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('client_id', client.id)
        .order('is_primary', { ascending: false })

      return vehicles || []
    }
  })
}
