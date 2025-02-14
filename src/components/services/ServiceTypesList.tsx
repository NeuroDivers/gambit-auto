
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ServiceTypeDialog } from "./ServiceTypeDialog";
import { ServiceTypeCard } from "./ServiceTypeCard";
import { useState } from "react";
import { ServiceStatusFilter, ServiceTypeFilter } from "@/pages/ServiceTypes";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ServiceTypesListProps {
  searchQuery?: string;
  statusFilter?: ServiceStatusFilter;
  typeFilter?: ServiceTypeFilter;
  onSearch: (value: string) => void;
  onStatusFilter: (value: ServiceStatusFilter) => void;
  onTypeFilter: (value: ServiceTypeFilter) => void;
}

export const ServiceTypesList = ({ 
  searchQuery = "", 
  statusFilter = "all",
  typeFilter = "all",
  onSearch,
  onStatusFilter,
  onTypeFilter
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <Input
            type="search"
            placeholder="Search service types..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="bg-background/50 border-input flex-1 sm:max-w-[300px]"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {(statusFilter !== 'all' || typeFilter !== 'all') && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={statusFilter === 'all'}
                onCheckedChange={() => onStatusFilter('all')}
              >
                All Statuses
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === 'active'}
                onCheckedChange={() => onStatusFilter('active')}
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === 'inactive'}
                onCheckedChange={() => onStatusFilter('inactive')}
              >
                Inactive
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={typeFilter === 'all'}
                onCheckedChange={() => onTypeFilter('all')}
              >
                All Types
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter === 'standalone'}
                onCheckedChange={() => onTypeFilter('standalone')}
              >
                Standalone Services
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter === 'bundle'}
                onCheckedChange={() => onTypeFilter('bundle')}
              >
                Service Bundles
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter === 'sub_service'}
                onCheckedChange={() => onTypeFilter('sub_service')}
              >
                Sub Services
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          onClick={() => {
            setEditingService(null);
            setIsDialogOpen(true);
          }}
          className="w-full sm:w-auto text-white transition-colors duration-200 bg-violet-700 hover:bg-violet-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service Type
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
