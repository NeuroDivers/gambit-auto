
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ServiceTypeDialog } from "./ServiceTypeDialog";
import { ServiceTypeCard } from "./ServiceTypeCard";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ServiceTypesList = () => {
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
    service_type: 'standalone' | 'sub_service' | 'bundle';
  }>(null);

  const { data: serviceTypes, refetch } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select(`
          *,
          sub_services:service_types!parent_service_id(*)
        `)
        .is('parent_service_id', null)
        .order('name');
      
      if (error) throw error;
      return data;
    },
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
          className="bg-[#BB86FC] hover:bg-[#BB86FC]/90 text-white transition-colors duration-200"
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
            {serviceTypes?.map((service) => (
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
            {serviceTypes?.filter(s => s.service_type === 'standalone').map((service) => (
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
            {serviceTypes?.filter(s => s.service_type === 'bundle').map((service) => (
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
            {serviceTypes?.filter(s => s.service_type === 'sub_service').map((service) => (
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
        onOpenChange={(open) => {
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
}
