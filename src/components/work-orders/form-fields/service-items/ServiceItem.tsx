
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useState, useCallback, useEffect } from "react"

interface ServiceItemProps {
  index: number;
  services: any[];
  onRemove: (index: number) => void;
  field: any;
  form: any;
}

export function ServiceItem({ index, services, onRemove, field, form }: ServiceItemProps) {
  const [localServiceId, setLocalServiceId] = useState(field.value?.service_id || '');
  const [localPackageId, setLocalPackageId] = useState(field.value?.package_id || '');
  const selectedService = services.find(service => service.id === localServiceId);
  const availablePackages = selectedService?.service_packages?.filter((pkg: any) => pkg.status === 'active') || [];

  useEffect(() => {
    setLocalServiceId(field.value?.service_id || '');
    setLocalPackageId(field.value?.package_id || '');
  }, [field.value?.service_id, field.value?.package_id]);

  const handleServiceSelect = useCallback((serviceId: string) => {
    if (!serviceId) return;
    
    setLocalServiceId(serviceId);
    setLocalPackageId('');
    
    const selectedService = services.find(service => service.id === serviceId);
    if (selectedService) {
      const currentItems = form.getValues("service_items") || [];
      const updatedItems = [...currentItems];
      updatedItems[index] = {
        ...updatedItems[index],
        service_id: serviceId,
        service_name: selectedService.name,
        unit_price: selectedService.price || 0,
        package_id: null,
        package_name: null,
      };
      form.setValue("service_items", updatedItems, { shouldValidate: true });
    }
  }, [services, form, index]);

  const handlePackageSelect = useCallback((packageId: string) => {
    setLocalPackageId(packageId);
    
    const selectedPackage = availablePackages.find(pkg => pkg.id === packageId);
    if (selectedPackage) {
      const currentItems = form.getValues("service_items") || [];
      const updatedItems = [...currentItems];
      updatedItems[index] = {
        ...updatedItems[index],
        package_id: packageId,
        package_name: selectedPackage.name,
        service_name: selectedPackage.name,
        unit_price: selectedPackage.price || selectedPackage.sale_price || 0,
      };
      form.setValue("service_items", updatedItems, { shouldValidate: true });
    }
  }, [availablePackages, form, index]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const currentItems = form.getValues("service_items") || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: value || 0,
    };
    form.setValue("service_items", updatedItems, { shouldValidate: true });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const currentItems = form.getValues("service_items") || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      unit_price: value || 0,
    };
    form.setValue("service_items", updatedItems, { shouldValidate: true });
  };

  return (
    <div className="relative space-y-4 p-4 border rounded-lg bg-card">
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
          <FormLabel>Service</FormLabel>
          <Select
            value={localServiceId}
            onValueChange={handleServiceSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service">
                {selectedService?.name || "Select a service"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {availablePackages.length > 0 && (
            <div className="mt-2">
              <FormLabel>Package</FormLabel>
              <Select
                value={localPackageId}
                onValueChange={handlePackageSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a package">
                    {field.value?.package_name || "Select a package"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availablePackages.map((pkg: any) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} {pkg.price ? `- $${pkg.price}` : pkg.sale_price ? `- $${pkg.sale_price}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <FormLabel>Quantity</FormLabel>
          <Input
            type="number"
            min={1}
            value={field.value?.quantity || 0}
            onChange={handleQuantityChange}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Unit Price</FormLabel>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={field.value?.unit_price || 0}
            onChange={handlePriceChange}
          />
        </div>
      </div>
    </div>
  );
}
