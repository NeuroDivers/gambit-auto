import React, { useState } from 'react';
import { ServiceItemProps } from "./types";
import { ServiceDropdown } from "./ServiceDropdown";
import { ServiceDescription } from "./ServiceDescription";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export function ServiceItem({
  service,
  onEdit,
  onRemove,
  isExpanded,
  onToggleExpand,
  availableServices,
  onChange
}: ServiceItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle different usage patterns based on which props are provided
  if (onEdit && onRemove && availableServices === undefined && onChange === undefined) {
    // First usage pattern with onEdit/onRemove
    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/*<ServiceDropdown
              selectedServiceName={service.service_name}
              servicesByType={servicesByType}
              open={isOpen}
              setOpen={setIsOpen}
              handleServiceSelect={(serviceId) => {
                const selectedService = availableServices.find(s => s.id === serviceId);
                if (selectedService) {
                  onChange({
                    ...service,
                    service_id: serviceId,
                    service_name: selectedService.name
                  });
                }
              }}
              serviceId={service.service_id}
            />*/}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(service.service_id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              value={service.quantity}
              onChange={(e) => onChange({
                ...service,
                quantity: parseInt(e.target.value) || 1
              })}
            />
          </div>
          <div>
            <Label>Price</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={service.unit_price}
              onChange={(e) => onChange({
                ...service,
                unit_price: parseFloat(e.target.value) || 0
              })}
            />
          </div>
        </div>

        {/*<ServiceDescription
          selectedServiceId={service.service_id}
          servicesByType={servicesByType}
          expanded={isExpanded}
          onExpandToggle={onToggleExpand}
        />*/}
      </div>
    );
  }
  
  // Second usage pattern with availableServices/onChange
  if (!availableServices || !onChange) {
    return null;
  }
  
  const servicesByType = {
    "available": availableServices
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <ServiceDropdown
            service={service}
            onEdit={() => {}}
            onRemove={() => {}}
            selectedServiceName={service.service_name}
            servicesByType={servicesByType}
            open={isOpen}
            setOpen={setIsOpen}
            handleServiceSelect={(serviceId) => {
              const selectedService = availableServices.find(s => s.id === serviceId);
              if (selectedService) {
                onChange({
                  ...service,
                  service_id: serviceId,
                  service_name: selectedService.name
                });
              }
            }}
            serviceId={service.service_id}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(service.service_id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Quantity</Label>
          <Input
            type="number"
            min="1"
            value={service.quantity}
            onChange={(e) => onChange({
              ...service,
              quantity: parseInt(e.target.value) || 1
            })}
          />
        </div>
        <div>
          <Label>Price</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={service.unit_price}
            onChange={(e) => onChange({
              ...service,
              unit_price: parseFloat(e.target.value) || 0
            })}
          />
        </div>
      </div>

      <ServiceDescription
        description=""
        onChange={() => {}}
        selectedServiceId={service.service_id}
        servicesByType={servicesByType}
        expanded={!!isExpanded}
        onExpandToggle={onToggleExpand || (() => {})}
      />
    </div>
  );
}
