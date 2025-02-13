
import React, { useRef } from 'react';
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Portal } from "@radix-ui/react-portal"

interface ServiceItemProps {
  index: number;
  services: any[];
  onRemove: (index: number) => void;
  field: any;
  form: any;
}

export function ServiceItem({ index, services, onRemove, field, form }: ServiceItemProps) {
  const servicePortalRef = useRef<HTMLDivElement>(null);
  const packagePortalRef = useRef<HTMLDivElement>(null);
  const selectedService = services.find(service => service.id === field.value?.service_id);
  const availablePackages = selectedService?.service_packages?.filter((pkg: any) => pkg.status === 'active') || [];

  const handleServiceChange = (value: string) => {
    const service = services.find(s => s.id === value);
    if (!service) return;

    const currentItems = form.getValues("service_items") || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      service_id: value,
      service_name: service.name,
      unit_price: service.price || 0,
      package_id: null,
      package_name: null
    };
    form.setValue("service_items", updatedItems, { shouldValidate: true });
  };

  const handlePackageChange = (value: string) => {
    const pkg = availablePackages.find(p => p.id === value);
    if (!pkg) return;

    const currentItems = form.getValues("service_items") || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      package_id: value,
      package_name: pkg.name,
      service_name: pkg.name,
      unit_price: pkg.price || pkg.sale_price || 0
    };
    form.setValue("service_items", updatedItems, { shouldValidate: true });
  };

  const handleInputChange = (key: string, value: number) => {
    const currentItems = form.getValues("service_items") || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [key]: value
    };
    form.setValue("service_items", updatedItems, { shouldValidate: true });
  };

  return (
    <div className="relative space-y-4 p-4 border rounded-lg bg-card">
      <div ref={servicePortalRef} />
      <div ref={packagePortalRef} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="absolute right-2 top-2"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <FormItem>
            <FormLabel>Service</FormLabel>
            <Select 
              value={field.value?.service_id || ''} 
              onValueChange={handleServiceChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service">
                    {selectedService?.name || "Select a service"}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <Portal container={servicePortalRef.current}>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Portal>
            </Select>
          </FormItem>

          {availablePackages.length > 0 && (
            <FormItem>
              <FormLabel>Package</FormLabel>
              <Select
                value={field.value?.package_id || ''}
                onValueChange={handlePackageChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a package">
                      {field.value?.package_name || "Select a package"}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <Portal container={packagePortalRef.current}>
                  <SelectContent>
                    {availablePackages.map((pkg: any) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} {pkg.price ? `- $${pkg.price}` : pkg.sale_price ? `- $${pkg.sale_price}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Portal>
              </Select>
            </FormItem>
          )}
        </div>

        <div className="space-y-2">
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                value={field.value?.quantity || 0}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              />
            </FormControl>
          </FormItem>
        </div>

        <div className="space-y-2">
          <FormItem>
            <FormLabel>Unit Price</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={field.value?.unit_price || 0}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
              />
            </FormControl>
          </FormItem>
        </div>
      </div>
    </div>
  );
}
