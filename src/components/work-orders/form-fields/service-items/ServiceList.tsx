
import { useState, useEffect } from "react";
import { ServiceItem } from "./ServiceItem";
import { useServiceTypes } from "@/components/service-bays/hooks/useServiceTypes";
import { PackageSelect } from "./PackageSelect";
import { Button } from "@/components/ui/button";
import { ServiceType } from "@/integrations/supabase/types/service-types";

// Define the service item type that's compatible with both uses
interface ServiceItemType {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  commission_rate?: number;
  commission_type?: 'percentage' | 'flat' | 'flat_rate' | null;
  assigned_profile_id?: string | null;
  description?: string;
  sub_services?: ServiceItemType[];
  is_parent?: boolean;
  parent_id?: string;
  package_id?: string | null;
}

const dummyPackages = [
  { id: "1", name: "Basic Package" },
  { id: "2", name: "Premium Package" }
];

export interface ServiceListProps {
  serviceItems: ServiceItemType[];
  onChange: (serviceItems: ServiceItemType[]) => void;
  hasPackages?: boolean;
}

export function ServiceList({ serviceItems, onChange, hasPackages = false }: ServiceListProps) {
  const { data: servicesData, isLoading } = useServiceTypes();
  const [services, setServices] = useState<ServiceType[]>([]);

  useEffect(() => {
    if (servicesData && Array.isArray(servicesData)) {
      const filteredServices = servicesData.filter(
        (service) => service.status === "active"
      );
      setServices(filteredServices as unknown as ServiceType[]);
    }
  }, [servicesData]);

  return (
    <div className="space-y-4">
      {serviceItems.map((service, index) => (
        <ServiceItem
          key={index}
          service={service}
          availableServices={services}
          onRemove={() => onChange(serviceItems.filter((_, i) => i !== index))}
          onChange={(updatedService) => onChange(serviceItems.map((s, i) => i === index ? updatedService : s))}
        />
      ))}
      {hasPackages && <PackageSelect 
        packages={dummyPackages}
        value={null}
        packageName=""
        onValueChange={() => {}}
      />}
    </div>
  );
}
