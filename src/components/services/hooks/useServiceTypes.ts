
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceStatusFilter, ServiceTypeFilter } from "@/pages/ServiceTypes";

export interface ServiceType {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  description: string | null;
  price: number | null;
  duration: number | null;
  pricing_model?: 'flat_rate' | 'hourly' | 'variable';
  base_price?: number | null;
  service_type?: 'standalone' | 'sub_service' | 'bundle';
  parent_service_id?: string | null;
  sub_services?: ServiceType[];
  parent?: {
    id: string;
    name: string;
    status: 'active' | 'inactive';
  } | null;
  included_in_bundles?: ServiceType[];
  bundle_includes?: ServiceType[];
}

export const useServiceTypes = (
  searchQuery: string = "",
  statusFilter: ServiceStatusFilter = "all",
  typeFilter: ServiceTypeFilter = "all"
) => {
  const { data: serviceTypes, refetch } = useQuery({
    queryKey: ["serviceTypes", searchQuery, statusFilter, typeFilter],
    queryFn: async () => {
      // Get all services with their parent information
      const { data: services, error: servicesError } = await supabase
        .from("service_types")
        .select(`
          *,
          parent:service_types(
            id,
            name,
            status
          )
        `)
        .order('name');
      
      if (servicesError) {
        console.error('Services error:', servicesError);
        throw servicesError;
      }

      console.log('Raw services data:', services);

      // Get all sub-services relationships
      const { data: subServices, error: subServicesError } = await supabase
        .from("service_types")
        .select(`
          id,
          name,
          status,
          service_type,
          description,
          parent_service_id
        `)
        .not('parent_service_id', 'is', null);

      if (subServicesError) throw subServicesError;

      // Get bundle relationships
      const { data: bundleRelations, error: bundleError } = await supabase
        .from('bundle_services')
        .select(`
          bundle_id,
          service_id,
          bundle:service_types(*),
          service:service_types(*)
        `);

      if (bundleError) throw bundleError;

      // Transform services to include all relationships
      const servicesWithRelations = services.map(service => {
        // Get the parent from the parent array (Supabase returns it as an array)
        const parentService = Array.isArray(service.parent) ? service.parent[0] : service.parent;

        return {
          ...service,
          parent: parentService || null,
          sub_services: subServices.filter(sub => sub.parent_service_id === service.id),
          included_in_bundles: bundleRelations
            .filter(rel => rel.service_id === service.id)
            .map(rel => rel.bundle),
          bundle_includes: bundleRelations
            .filter(rel => rel.bundle_id === service.id)
            .map(rel => rel.service)
        };
      });

      return servicesWithRelations;
    }
  });

  const filteredServices = serviceTypes?.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ? true : service.status === statusFilter;

    const matchesType = 
      typeFilter === 'all' ? true : service.service_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return { serviceTypes: filteredServices, refetch };
};
