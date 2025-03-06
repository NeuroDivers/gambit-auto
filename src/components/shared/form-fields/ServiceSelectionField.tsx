
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ServiceItemType, ServiceSelectionFieldProps } from "./service-selection/types";
import { ServiceItem } from "./service-selection/ServiceItem";
import { ServiceItemForm } from "./service-selection/ServiceItemForm";
import { Card } from "@/components/ui/card";

export default function ServiceSelectionField({
  services = [],
  onChange,
  showCommission = false,
  showAssignedStaff = false,
  disabled = false,
  onServicesChange,
  allowPriceEdit = true
}: ServiceSelectionFieldProps) {
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [addingNewService, setAddingNewService] = useState(false);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  const handleEdit = (service: ServiceItemType) => {
    setEditingServiceId(service.service_id);
  };

  const handleRemove = (serviceId: string) => {
    const updatedServices = services.filter(s => s.service_id !== serviceId);
    onChange(updatedServices);
    if (onServicesChange) {
      onServicesChange(updatedServices);
    }
  };

  const handleUpdate = (updatedService: ServiceItemType) => {
    const updatedServices = services.map(s => 
      s.service_id === updatedService.service_id ? updatedService : s
    );
    onChange(updatedServices);
    if (onServicesChange) {
      onServicesChange(updatedServices);
    }
    setEditingServiceId(null);
  };

  const handleAddNew = (newService: ServiceItemType) => {
    const updatedServices = [...services, newService];
    onChange(updatedServices);
    if (onServicesChange) {
      onServicesChange(updatedServices);
    }
    setAddingNewService(false);
  };

  const handleToggleExpand = (serviceId: string) => {
    setExpandedServiceId(expandedServiceId === serviceId ? null : serviceId);
  };

  const emptyService: ServiceItemType = {
    service_id: `new-${Date.now()}`,
    service_name: "",
    quantity: 1,
    unit_price: 0,
    commission_rate: 0,
    commission_type: null,
    description: ""
  };

  return (
    <div className="space-y-4">
      {services.length === 0 && !addingNewService && (
        <Card className="p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-muted-foreground/30 bg-muted/10">
          <p className="text-muted-foreground mb-4">No services added yet</p>
          <Button
            onClick={() => setAddingNewService(true)}
            variant="outline"
            className="gap-1"
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </Card>
      )}

      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.service_id}>
            {editingServiceId === service.service_id ? (
              <ServiceItemForm
                service={service}
                onUpdate={handleUpdate}
                onCancel={() => setEditingServiceId(null)}
                showCommission={showCommission}
                showAssignedStaff={showAssignedStaff}
              />
            ) : (
              <ServiceItem
                service={service}
                onEdit={handleEdit}
                onRemove={handleRemove}
                isExpanded={expandedServiceId === service.service_id}
                onToggleExpand={() => handleToggleExpand(service.service_id)}
              />
            )}
          </div>
        ))}

        {addingNewService && (
          <ServiceItemForm
            service={emptyService}
            onUpdate={handleAddNew}
            onCancel={() => setAddingNewService(false)}
            showCommission={showCommission}
            showAssignedStaff={showAssignedStaff}
          />
        )}
      </div>

      {!addingNewService && services.length > 0 && (
        <Button
          onClick={() => setAddingNewService(true)}
          variant="outline"
          className="gap-1 mt-4"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          Add Another Service
        </Button>
      )}
    </div>
  );
}

// Export both the default and named export for backward compatibility
export { ServiceSelectionField };
