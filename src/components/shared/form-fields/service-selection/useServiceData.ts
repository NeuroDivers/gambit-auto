
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useServiceData() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select(`
          *,
          service_packages (
            id,
            name,
            description,
            price,
            sale_price,
            status
          )
        `)
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      return data
    }
  })
}
