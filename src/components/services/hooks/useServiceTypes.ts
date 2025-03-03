
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceStatusFilter, ServiceTypeFilter } from "@/types/service-types";

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
      // Get all services first
      const { data: services, error: servicesError } = await supabase
        .from("service_types")
        .select('*')
        .order('name');
      
      if (servicesError) {
        console.error('Services error:', servicesError);
        throw servicesError;
      }

      // Get parent service information
      const parentServiceIds = services
        .filter(s => s.parent_service_id)
        .map(s => s.parent_service_id);

      const { data: parentServices, error: parentsError } = await supabase
        .from("service_types")
        .select('id, name, status')
        .in('id', parentServiceIds.length > 0 ? parentServiceIds : ['00000000-0000-0000-0000-000000000000']);

      if (parentsError) throw parentsError;

      // Get bundle relationships - now with explicit foreign key references
      const { data: bundleRelations, error: bundleError } = await supabase
        .from('bundle_services')
        .select(`
          bundle_id,
          service_id,
          bundle:service_types!bundle_services_bundle_id_fkey(*),
          service:service_types!bundle_services_service_id_fkey(*)
        `);

      if (bundleError) {
        console.error('Bundle error:', bundleError);
        throw bundleError;
      }

      // Transform services to include all relationships
      const servicesWithRelations = services.map(service => {
        const parentService = parentServices?.find(p => p.id === service.parent_service_id);
        const subServices = services.filter(s => s.parent_service_id === service.id);

        return {
          ...service,
          parent: parentService || null,
          sub_services: subServices,
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
    // First check search query
    const matchesSearch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Then check status filter
    const matchesStatus = 
      statusFilter === 'all' || service.status === statusFilter;

    // Finally check type filter
    const matchesType = 
      typeFilter === 'all' || service.service_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return { serviceTypes: filteredServices, refetch };
};
