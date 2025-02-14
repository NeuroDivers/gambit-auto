
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceTypeDialog } from "./ServiceTypeDialog";
import { ServiceTypeCard } from "./ServiceTypeCard";
import { useState } from "react";
import { ServiceStatusFilter, ServiceTypeFilter } from "@/pages/ServiceTypes";
import { ServiceFilters } from "./filters/ServiceFilters";
import { useServiceTypes, ServiceType } from "./hooks/useServiceTypes";

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
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const { serviceTypes, refetch } = useServiceTypes(searchQuery, statusFilter, typeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <ServiceFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onSearch={onSearch}
          onStatusFilter={onStatusFilter}
          onTypeFilter={onTypeFilter}
        />
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
        {serviceTypes?.map(service => (
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
