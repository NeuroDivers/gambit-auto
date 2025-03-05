import React, { useState } from 'react';
import { ServiceItemType } from "@/types/service-item";
import { ServiceItem, ServiceItemForm } from "@/components/shared/form-fields/service-selection";

interface ServiceListProps {
  services: ServiceItemType[];
  onUpdateService: (updatedService: ServiceItemType) => void;
  onRemoveService: (serviceId: string) => void;
  showCommission?: boolean;
  showAssignedStaff?: boolean;
  disabled?: boolean;
}

export function ServiceList({
  services,
  onUpdateService,
  onRemoveService,
  showCommission = false,
  showAssignedStaff = false,
  disabled = false,
}: ServiceListProps) {
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const isEditing = !!editingServiceId;

  const handleEditService = (service: ServiceItemType) => {
    setEditingServiceId(service.service_id);
  };

  const handleUpdateService = (updatedService: ServiceItemType) => {
    onUpdateService(updatedService);
    setEditingServiceId(null);
  };

  const handleRemoveService = (serviceId: string) => {
    onRemoveService(serviceId);
  };

  return (
    <div className="space-y-3">
      {services.map((service, index) => {
        const isEditingThis = isEditing && editingServiceId === service.service_id;
        
        return isEditingThis ? (
          <ServiceItemForm
            key={index}
            service={service}
            onUpdate={handleUpdateService}
            onCancel={() => setEditingServiceId("")}
            showCommission={showCommission}
            showAssignedStaff={showAssignedStaff}
            disabled={disabled}
          />
        ) : (
          <ServiceItem
            key={index}
            service={service}
            isEditing={isEditing}
            onEdit={() => handleEditService(service)}
            onUpdate={handleUpdateService}
            onRemove={() => handleRemoveService(service.service_id)}
            onCancelEdit={() => setEditingServiceId("")}
            showCommission={showCommission}
            showAssignedStaff={showAssignedStaff}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}
