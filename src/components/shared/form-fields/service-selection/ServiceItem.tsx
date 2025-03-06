
import React, { useState } from 'react';
import { ServiceItemProps } from "./types";
import { ServiceDropdown } from './ServiceDropdown';
import { ServiceDescription } from './ServiceDescription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

export const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  availableServices,
  onRemove,
  onChange
}) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const servicesByType = {
    available: availableServices
  };

  const handleServiceSelect = (serviceId: string) => {
    const selectedService = availableServices.find(s => s.id === serviceId);
    if (selectedService) {
      onChange({
        ...service,
        service_id: selectedService.id,
        service_name: selectedService.name,
        unit_price: selectedService.price || 0
      });
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value) || 1;
    onChange({
      ...service,
      quantity
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unitPrice = parseFloat(e.target.value) || 0;
    onChange({
      ...service,
      unit_price: unitPrice
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...service,
      description: e.target.value
    });
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRemove();
  };

  return (
    <div className="bg-muted/30 p-3 rounded-md mt-2">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-5">
          <ServiceDropdown
            selectedServiceName={service.service_name}
            servicesByType={servicesByType}
            open={open}
            setOpen={setOpen}
            handleServiceSelect={handleServiceSelect}
            serviceId={service.service_id}
          />
        </div>
        <div className="col-span-2">
          <Input
            type="number"
            min="1"
            value={service.quantity}
            onChange={handleQuantityChange}
            className="h-9"
          />
        </div>
        <div className="col-span-3">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={service.unit_price}
            onChange={handlePriceChange}
            className="h-9"
          />
        </div>
        <div className="col-span-2 flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveClick}
            className="h-9 w-9 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ServiceDescription
        service={service}
        expanded={expanded}
        onExpandToggle={() => setExpanded(!expanded)}
      />

      <div className="mt-2">
        <Input
          placeholder="Additional details or notes about this service"
          value={service.description || ''}
          onChange={handleDescriptionChange}
          className="text-sm"
        />
      </div>
    </div>
  );
};
