
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceItemType, ServicesByType } from './types';
import { ServiceDropdown } from './ServiceDropdown';
import { ServiceDescription } from './ServiceDescription';
import { Trash2 } from 'lucide-react';

interface ServiceItemFormProps {
  service: ServiceItemType;
  services: ServicesByType;
  onChange: (service: ServiceItemType) => void;
  onRemove: () => void;
  showCommission?: boolean;
  allowPriceEdit?: boolean;
}

export const ServiceItemForm: React.FC<ServiceItemFormProps> = ({
  service,
  services,
  onChange,
  onRemove,
  showCommission = false,
  allowPriceEdit = true
}) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleServiceSelect = (serviceId: string) => {
    const allServices = Object.values(services).flat();
    const selectedService = allServices.find(s => s.id === serviceId);
    
    if (!selectedService) return;
    
    onChange({
      ...service,
      service_id: selectedService.id,
      service_name: selectedService.name,
      unit_price: selectedService.base_price || 0
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    onChange({
      ...service,
      quantity: value
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onChange({
      ...service,
      unit_price: value
    });
  };

  const handleCommissionRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onChange({
      ...service,
      commission_rate: value
    });
  };

  const handleCommissionTypeChange = (value: string) => {
    onChange({
      ...service,
      commission_type: value as 'percentage' | 'flat' | 'flat_rate' | null
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...service,
      description: e.target.value
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex justify-between items-start">
        <ServiceDropdown
          selectedServiceName={service.service_name}
          servicesByType={services}
          open={open}
          setOpen={setOpen}
          handleServiceSelect={handleServiceSelect}
          serviceId={service.service_id}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRemove}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ServiceDescription
        service={service}
        servicesByType={services}
        expanded={expanded}
        onExpandToggle={() => setExpanded(!expanded)}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={service.quantity}
            onChange={handleQuantityChange}
          />
        </div>
        
        <div>
          <Label htmlFor="price">Unit Price</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={service.unit_price}
            onChange={handlePriceChange}
            disabled={!allowPriceEdit}
          />
        </div>
      </div>

      {showCommission && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="commissionRate">Commission Rate</Label>
            <Input
              id="commissionRate"
              type="number"
              min="0"
              step="0.01"
              value={service.commission_rate || 0}
              onChange={handleCommissionRateChange}
            />
          </div>
          
          <div>
            <Label htmlFor="commissionType">Commission Type</Label>
            <Select
              value={service.commission_type || ''}
              onValueChange={handleCommissionTypeChange}
            >
              <SelectTrigger id="commissionType">
                <SelectValue placeholder="Select commission type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="flat">Flat Rate</SelectItem>
                <SelectItem value="flat_rate">Package Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="description">Additional Details</Label>
        <Input
          id="description"
          placeholder="Additional details or notes about this service"
          value={service.description || ''}
          onChange={handleDescriptionChange}
        />
      </div>
    </div>
  );
};
