
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useServiceData() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select(`
          id,
          name,
          description,
          price,
          status,
          hierarchy_type,
          parent_service_id,
          sort_order,
          requires_main_service,
          can_be_standalone,
          sub_services:service_types!parent_service_id(
            id,
            name,
            description,
            price,
            status,
            hierarchy_type,
            requires_main_service,
            can_be_standalone,
            sort_order
          ),
          service_packages!service_packages_service_id_fkey (
            id,
            name,
            description,
            price,
            sale_price,
            status,
            type
          )
        `)
        .eq('status', 'active')
        .eq('hierarchy_type', 'main')
        .order('sort_order')

      if (error) throw error
      return data || []
    }
  })
}

export function useSubServices(mainServiceId: string | null) {
  return useQuery({
    queryKey: ["subServices", mainServiceId],
    enabled: !!mainServiceId,
    queryFn: async () => {
      if (!mainServiceId) return []
      
      const { data, error } = await supabase
        .from("service_types")
        .select(`
          id,
          name,
          description,
          price,
          status,
          hierarchy_type,
          requires_main_service,
          can_be_standalone,
          sort_order
        `)
        .eq('status', 'active')
        .eq('hierarchy_type', 'sub')
        .eq('parent_service_id', mainServiceId)
        .order('sort_order')

      if (error) throw error
      return data || []
    }
  })
}
