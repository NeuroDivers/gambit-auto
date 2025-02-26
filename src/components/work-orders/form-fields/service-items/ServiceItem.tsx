import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceItemProps } from "@/components/shared/form-fields/service-selection/types";

export function ServiceItem({
  index,
  service,
  availableServices,
  onRemove,
  onChange
}: ServiceItemProps) {
  const [selectedService, setSelectedService] = useState(service.service_id);

  useEffect(() => {
    setSelectedService(service.service_id);
  }, [service.service_id]);

  const handleServiceChange = (serviceId: string) => {
    const selected = availableServices.find(s => s.id === serviceId);
    if (selected) {
      onChange({
        ...service,
        service_id: selected.id,
        service_name: selected.name,
        unit_price: selected.price || 0
      });
      setSelectedService(selected.id);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value);
    onChange({ ...service, quantity: isNaN(quantity) ? 1 : quantity });
  };

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unitPrice = parseFloat(e.target.value);
    onChange({ ...service, unit_price: isNaN(unitPrice) ? 0 : unitPrice });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor={`service-${index}`}>Service</Label>
        <Select onValueChange={handleServiceChange} defaultValue={selectedService}>
          <SelectTrigger id={`service-${index}`}>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {availableServices.map(s => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
        <Input
          type="number"
          id={`quantity-${index}`}
          value={service.quantity}
          onChange={handleQuantityChange}
        />
      </div>
      <div>
        <Label htmlFor={`unit-price-${index}`}>Unit Price</Label>
        <Input
          type="number"
          id={`unit-price-${index}`}
          value={service.unit_price}
          onChange={handleUnitPriceChange}
        />
      </div>
      <button type="button" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}
