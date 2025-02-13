
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useState, useEffect } from "react"

interface ServiceItemProps {
  index: number;
  services: any[];
  onRemove: (index: number) => void;
  field: any;
  form: any;
}

export function ServiceItem({ index, services, onRemove, field, form }: ServiceItemProps) {
  const selectedService = services.find(service => service.id === field.value?.service_id);
  const availablePackages = selectedService?.service_packages?.filter((pkg: any) => pkg.status === 'active') || [];

  const updateFormField = (updates: any) => {
    const currentItems = form.getValues("service_items") || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      ...updates
    };
    form.setValue("service_items", updatedItems, { shouldValidate: true });
  };

  const handleServiceSelect = (serviceId: string) => {
    if (!serviceId) return;
    
    const selectedService = services.find(service => service.id === serviceId);
    if (selectedService) {
      updateFormField({
        service_id: serviceId,
        service_name: selectedService.name,
        unit_price: selectedService.price || 0,
        package_id: null,
        package_name: null,
      });
    }
  };

  const handlePackageSelect = (packageId: string) => {
    const selectedPackage = availablePackages.find(pkg => pkg.id === packageId);
    if (selectedPackage) {
      updateFormField({
        package_id: packageId,
        package_name: selectedPackage.name,
        service_name: selectedPackage.name,
        unit_price: selectedPackage.price || selectedPackage.sale_price || 0,
      });
    }
  };

  const handleQuantityChange = (value: number) => {
    updateFormField({ quantity: value || 0 });
  };

  const handlePriceChange = (value: number) => {
    updateFormField({ unit_price: value || 0 });
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
            defaultValue={field.value?.service_id}
            onValueChange={handleServiceSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service">
                {selectedService?.name}
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
                defaultValue={field.value?.package_id}
                onValueChange={handlePackageSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a package">
                    {field.value?.package_name}
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
            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Unit Price</FormLabel>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={field.value?.unit_price || 0}
            onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
