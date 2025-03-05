
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import { PackageSelect } from "./PackageSelect";
import { ServiceItem } from "./ServiceItem";
import { ServiceItemType } from "@/types/service-item";

interface ServiceListProps {
  services: ServiceItemType[];
  onChange: (services: ServiceItemType[]) => void;
  showCommission?: boolean;
}

export function ServiceList({ services = [], onChange, showCommission = false }: ServiceListProps) {
  const [showPackageSelect, setShowPackageSelect] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const { data: serviceTypes = [], isLoading } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, description, price, hierarchy_type, parent_service_id")
        .eq("status", "active")
        .order("name");
        
      if (error) throw error;
      return data || [];
    }
  });
  
  const handleServiceUpdate = (index: number, updatedService: ServiceItemType) => {
    const newServices = [...services];
    newServices[index] = updatedService;
    onChange(newServices);
    setEditingIndex(null);
  };
  
  const handleServiceRemove = (index: number) => {
    const newServices = [...services];
    newServices.splice(index, 1);
    onChange(newServices);
  };
  
  const handleServiceAdd = () => {
    const newService: ServiceItemType = {
      service_id: "",
      service_name: "",
      quantity: 1,
      unit_price: 0,
      commission_rate: 0,
      commission_type: "percentage",
      description: ""
    };
    
    onChange([...services, newService]);
    setEditingIndex(services.length);
  };
  
  const handlePackageSelect = (packageServices: ServiceItemType[]) => {
    onChange([...services, ...packageServices]);
    setShowPackageSelect(false);
  };
  
  return (
    <div className="space-y-4">
      {services.length === 0 ? (
        <Card className="p-8 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground mb-4">No services added yet</p>
          <div className="flex space-x-4">
            <Button
              onClick={handleServiceAdd}
              variant="outline"
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
            <Button
              onClick={() => setShowPackageSelect(true)}
              variant="outline"
              className="flex items-center"
            >
              <Package className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {services.map((service, index) => (
              <ServiceItem
                key={index}
                service={service}
                serviceTypes={serviceTypes}
                isEditing={editingIndex === index}
                onEdit={() => setEditingIndex(index)}
                onUpdate={(updatedService) => handleServiceUpdate(index, updatedService)}
                onRemove={() => handleServiceRemove(index)}
                onCancelEdit={() => setEditingIndex(null)}
                showCommission={showCommission}
              />
            ))}
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button
              onClick={handleServiceAdd}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
            <Button
              onClick={() => setShowPackageSelect(true)}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <Package className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </div>
        </>
      )}
      
      {showPackageSelect && (
        <PackageSelect
          onSelect={handlePackageSelect}
          onCancel={() => setShowPackageSelect(false)}
        />
      )}
    </div>
  );
}
