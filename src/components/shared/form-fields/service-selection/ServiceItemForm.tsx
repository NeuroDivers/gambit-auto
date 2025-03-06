
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { ServiceItemFormProps, ServiceItemType, ServicesByType } from "./types";
import { ServiceDropdown } from "./ServiceDropdown";
import { ServiceDescription } from "./ServiceDescription";
import { CommissionRateFields } from "../CommissionRateFields";

export function ServiceItemForm({
  service,
  onUpdate,
  onCancel,
  showCommission = false,
  showAssignedStaff = false,
  services,
  onRemove,
  onChange,
  disabled = false
}: ServiceItemFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleServiceChange = (updates: Partial<ServiceItemType>) => {
    if (onChange) {
      onChange({
        ...service,
        ...updates
      });
    } else if (onUpdate) {
      onUpdate({
        ...service,
        ...updates
      });
    }
  };

  // Handle case when used with services
  if (services) {
    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <ServiceDropdown
              selectedServiceName={service.service_name}
              servicesByType={services}
              open={isOpen}
              setOpen={setIsOpen}
              handleServiceSelect={(serviceId) => {
                const selectedService = Object.values(services)
                  .flat()
                  .find(s => s && typeof s === 'object' && 'id' in s && s.id === serviceId);
                if (selectedService) {
                  handleServiceChange({
                    service_id: serviceId,
                    service_name: selectedService.name
                  });
                }
              }}
              serviceId={service.service_id}
              service={service}
              onEdit={() => {}}
              onRemove={() => {}}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove || onCancel}
            disabled={disabled}
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
              onChange={(e) => handleServiceChange({ quantity: parseInt(e.target.value) || 1 })}
              disabled={disabled}
            />
          </div>
          <div>
            <Label>Price</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={service.unit_price}
              onChange={(e) => handleServiceChange({ unit_price: parseFloat(e.target.value) || 0 })}
              disabled={disabled}
            />
          </div>
        </div>

        {showCommission && (
          <div className="pt-2">
            <CommissionRateFields
              value={{
                rate: service.commission_rate,
                type: service.commission_type === 'flat' ? 'flat' : 'percentage'
              }}
              onChange={(value) => {
                handleServiceChange({
                  commission_rate: value.rate ?? 0,
                  commission_type: value.type === 'flat' ? 'flat' : 'percentage'
                });
              }}
              disabled={disabled}
            />
          </div>
        )}

        <ServiceDescription
          description=""
          onChange={() => {}}
          selectedServiceId={service.service_id}
          servicesByType={services}
          expanded={isExpanded}
          onExpandToggle={() => setIsExpanded(!isExpanded)}
        />
      </div>
    );
  }

  // Original implementation for other use cases
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <ServiceDropdown
            selectedServiceName={service.service_name}
            servicesByType={services}
            open={isOpen}
            setOpen={setIsOpen}
            handleServiceSelect={(serviceId) => {
              const selectedService = Object.values(services || {})
                .flat()
                .find(s => s && s.id === serviceId);
              if (selectedService) {
                handleServiceChange({
                  service_id: serviceId,
                  service_name: selectedService.name
                });
              }
            }}
            serviceId={service.service_id}
            service={service}
            onEdit={() => {}}
            onRemove={() => {}}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
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
            onChange={(e) => handleServiceChange({ quantity: parseInt(e.target.value) || 1 })}
            disabled={disabled}
          />
        </div>
        <div>
          <Label>Price</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={service.unit_price}
            onChange={(e) => handleServiceChange({ unit_price: parseFloat(e.target.value) || 0 })}
            disabled={disabled}
          />
        </div>
      </div>

      {showCommission && (
        <div className="pt-2">
          <CommissionRateFields
            value={{
              rate: service.commission_rate,
              type: service.commission_type === 'flat' ? 'flat' : 'percentage'
            }}
            onChange={(value) => {
              handleServiceChange({
                commission_rate: value.rate ?? 0,
                commission_type: value.type === 'flat' ? 'flat' : 'percentage'
              });
            }}
            disabled={disabled}
          />
        </div>
      )}

      <ServiceDescription
        description=""
        onChange={() => {}}
        selectedServiceId={service.service_id}
        servicesByType={services}
        expanded={isExpanded}
        onExpandToggle={() => setIsExpanded(!isExpanded)}
      />
    </div>
  );
}
