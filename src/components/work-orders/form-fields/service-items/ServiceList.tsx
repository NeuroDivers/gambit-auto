
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ServiceItem } from "./ServiceItem";
import { ServiceItemType } from "@/components/shared/form-fields/service-selection/types";
import { PackageSelect } from "./PackageSelect";

interface ServiceListProps {
  services: ServiceItemType[];
  onChange: (services: ServiceItemType[]) => void;
  disabled?: boolean;
  showCommission?: boolean;
  showAssignedStaff?: boolean;
}

export function ServiceList({
  services,
  onChange,
  disabled = false,
  showCommission = true,
  showAssignedStaff = true,
}: ServiceListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showPackageSelect, setShowPackageSelect] = useState(false);

  const handleAddService = () => {
    // This would typically open a service selection dialog/dropdown
    // For now, we'll add a placeholder service
    const newService: ServiceItemType = {
      service_id: `temp-${Date.now()}`,
      service_name: "New Service",
      description: "",
      quantity: 1,
      unit_price: 0,
      commission_rate: 0,
      commission_type: "percentage",
      assigned_profile_id: null,
      assigned_profiles: [],
    };

    onChange([...services, newService]);
    setEditingIndex(services.length);
  };

  const handleEditService = (index: number) => {
    setEditingIndex(index);
  };

  const handleUpdateService = (updatedService: ServiceItemType, index: number) => {
    const updatedServices = [...services];
    updatedServices[index] = updatedService;
    onChange(updatedServices);
    setEditingIndex(null);
  };

  const handleRemoveService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    onChange(updatedServices);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleAddPackage = (packageServices: ServiceItemType[]) => {
    onChange([...services, ...packageServices]);
    setShowPackageSelect(false);
  };

  return (
    <div className="space-y-4">
      {services.length === 0 ? (
        <div className="text-center p-8 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No services selected</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleAddService}
            disabled={disabled}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>
      ) : (
        <>
          {services.map((service, index) => (
            <ServiceItem
              key={`${service.service_id}-${index}`}
              service={service}
              isEditing={editingIndex === index}
              onEdit={() => handleEditService(index)}
              onRemove={() => handleRemoveService(index)}
              onUpdate={(updatedService) => handleUpdateService(updatedService, index)}
              onCancelEdit={handleCancelEdit}
              disabled={disabled || editingIndex !== null}
              showCommission={showCommission}
              showAssignedStaff={showAssignedStaff}
            />
          ))}

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={handleAddService}
              disabled={disabled || editingIndex !== null}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPackageSelect(true)}
              disabled={disabled || editingIndex !== null}
            >
              Add Package
            </Button>
          </div>
        </>
      )}

      {showPackageSelect && (
        <PackageSelect
          onSelect={handleAddPackage}
          onCancel={() => setShowPackageSelect(false)}
        />
      )}
    </div>
  );
}
