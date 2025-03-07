
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceType } from '../types';

export function useServiceTypes() {
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['service-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('id, name, description')
        .order('name');

      if (error) throw error;
      return data as ServiceType[] || [];
    }
  });

  return { services, isLoadingServices };
}
