
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ServiceTypeDialog } from "./ServiceTypeDialog";
import { ServiceTypeCard } from "./ServiceTypeCard";
import { useState } from "react";
import { ServiceStatusFilter, ServiceTypeFilter } from "@/pages/ServiceTypes";

interface ServiceTypesListProps {
  searchQuery?: string;
  statusFilter?: ServiceStatusFilter;
  typeFilter?: ServiceTypeFilter;
}

export const ServiceTypesList = ({ 
  searchQuery = "", 
  statusFilter = "all",
  typeFilter = "all"
}: ServiceTypesListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<null | {
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
  }>(null);

  const { data: serviceTypes, refetch } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      const { data: services, error: servicesError } = await supabase
        .from("service_types")
        .select(`
          *,
          sub_services:service_types!parent_service_id(*)
        `)
        .order('name');
      
      if (servicesError) throw servicesError;

      const { data: bundleRelations, error: bundleError } = await supabase
        .from('bundle_services')
        .select(`
          bundle_id,
          service_id,
          bundle:service_types!bundle_services_bundle_id_fkey(*),
          service:service_types!bundle_services_service_id_fkey(*)
        `);

      if (bundleError) throw bundleError;

      const servicesWithBundles = services.map(service => ({
        ...service,
        included_in_bundles: bundleRelations
          .filter(rel => rel.service_id === service.id)
          .map(rel => rel.bundle),
        bundle_includes: bundleRelations
          .filter(rel => rel.bundle_id === service.id)
          .map(rel => rel.service)
      }));

      return servicesWithBundles;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white/[0.87]">Service Types</h2>
          <p className="text-white/60">Manage your service offerings</p>
        </div>
        <Button
          onClick={() => {
            setEditingService(null);
            setIsDialogOpen(true);
          }}
          className="text-white transition-colors duration-200 bg-violet-700 hover:bg-violet-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service Type
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices?.map(service => (
          <ServiceTypeCard
            key={service.id}
            service={service}
            onEdit={() => {
              setEditingService(service);
              setIsDialogOpen(true);
            }}
            onRefetch={refetch}
          />
        ))}
      </div>

      <ServiceTypeDialog
        open={isDialogOpen}
        onOpenChange={open => {
          setIsDialogOpen(open);
          if (!open) setEditingService(null);
        }}
        serviceType={editingService}
        onSuccess={() => {
          setIsDialogOpen(false);
          setEditingService(null);
          refetch();
        }}
      />
    </div>
  );
};
