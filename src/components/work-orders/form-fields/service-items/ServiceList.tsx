import { useEffect, useState } from "react";
import { ServiceItem } from "./ServiceItem";
import { useServiceTypes } from "@/components/service-bays/hooks/useServiceTypes";
import { ServiceItemType } from "@/components/work-orders/types";
import { PackageSelect } from "./PackageSelect";
import { Button } from "@/components/ui/button";
import { ServiceType } from "@/integrations/supabase/types/service-types";

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
      {hasPackages && <PackageSelect />}
    </div>
  );
}
