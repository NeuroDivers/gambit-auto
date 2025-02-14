
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ServiceTypeDialog } from "./ServiceTypeDialog";
import { ServiceTypeCard } from "./ServiceTypeCard";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServiceTypesListProps {
  searchQuery?: string;
}

export const ServiceTypesList = ({ searchQuery = "" }: ServiceTypesListProps) => {
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

      // Get bundle relationships in a separate query
      const { data: bundleRelations, error: bundleError } = await supabase
        .from('bundle_services')
        .select(`
          bundle_id,
          service_id,
          bundle:service_types!bundle_services_bundle_id_fkey(*),
          service:service_types!bundle_services_service_id_fkey(*)
        `);

      if (bundleError) throw bundleError;

      // Merge the bundle information into the services
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

  // Filter services based on search query
  const filteredServices = serviceTypes?.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="standalone">Standalone Services</TabsTrigger>
          <TabsTrigger value="bundles">Service Bundles</TabsTrigger>
          <TabsTrigger value="sub">Sub Services</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
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
        </TabsContent>

        <TabsContent value="standalone" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices?.filter(s => s.service_type === 'standalone').map(service => (
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
        </TabsContent>

        <TabsContent value="bundles" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices?.filter(s => s.service_type === 'bundle').map(service => (
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
        </TabsContent>

        <TabsContent value="sub" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices?.filter(s => s.service_type === 'sub_service').map(service => (
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
        </TabsContent>
      </Tabs>

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
