
import React from 'react';
import { ServiceDropdownProps } from './types';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ServiceDropdown({ 
  services, 
  selectedService, 
  onChange, 
  placeholder = "Select a service", 
  disabled = false 
}: ServiceDropdownProps) {
  if (!services || !Array.isArray(services) || services.length === 0) {
    return null;
  }

  return (
    <Select 
      value={selectedService} 
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {services.map((service) => (
            <SelectItem key={service.id} value={service.id}>
              {service.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
