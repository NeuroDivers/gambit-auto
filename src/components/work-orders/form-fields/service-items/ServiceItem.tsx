
import React, { useId } from 'react';
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Portal } from '@radix-ui/react-portal';

interface ServiceItemProps {
  index: number;
  services: any[];
  onRemove: (index: number) => void;
  field: any;
  form: any;
}

export function ServiceItem({ index, services, onRemove, field, form }: ServiceItemProps) {
  const uniqueId = useId();
  const selectedService = services.find(service => service.id === field.value?.service_id);
  const availablePackages = selectedService?.service_packages?.filter((pkg: any) => 
    pkg.status === 'active' && pkg.type === 'standalone'
  ) || [];

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
      package_name: null,
      addons: []
    };
    form.setValue("service_items", updatedItems, { shouldValidate: true });
  };

  const handlePackageChange = (value: string) => {
    const pkg = availablePackages.find(p => p.id === value);
    if (!pkg) return;

    const currentItems = form.getValues("service_items") || [];
    const updatedItems = [...currentItems];
    
    // Get available addons for this package
    const addons = selectedService?.service_packages?.filter((addon: any) => 
      addon.status === 'active' && 
      addon.type === 'addon' && 
      addon.parent_package_id === pkg.id
    ) || [];

    updatedItems[index] = {
      ...updatedItems[index],
      package_id: value,
      package_name: pkg.name,
      service_name: pkg.name,
      unit_price: pkg.price || pkg.sale_price || 0,
      addons: addons.map(addon => ({
        id: addon.id,
        name: addon.name,
        price: addon.price || addon.sale_price || 0,
        selected: false
      }))
    };
    form.setValue("service_items", updatedItems, { shouldValidate: true });
  };

  const handleAddonToggle = (addonId: string, checked: boolean) => {
    const currentItems = form.getValues("service_items") || [];
    const updatedItems = [...currentItems];
    const itemAddons = updatedItems[index].addons || [];
    
    const addonIndex = itemAddons.findIndex(addon => addon.id === addonId);
    if (addonIndex !== -1) {
      itemAddons[addonIndex].selected = checked;
      
      // Recalculate total price including selected addons
      const basePrice = updatedItems[index].unit_price;
      const addonsPrices = itemAddons
        .filter(addon => addon.selected)
        .reduce((sum, addon) => sum + (addon.price || 0), 0);
      
      updatedItems[index].unit_price = basePrice + addonsPrices;
    }
    
    form.setValue("service_items", updatedItems, { shouldValidate: true });
  };

  const portalContainer = document.getElementById('service-items-portal');

  if (!portalContainer) return null;

  return (
    <Card className="relative space-y-4 p-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="absolute right-2 top-2"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Service</Label>
          <Portal container={portalContainer}>
            <div className={`select-root-${uniqueId}`}>
              <Select 
                value={field.value?.service_id || ''} 
                onValueChange={handleServiceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Portal>
        </div>

        {availablePackages.length > 0 && (
          <div className="space-y-2">
            <Label>Package</Label>
            <Portal container={portalContainer}>
              <div className={`select-root-${uniqueId}-package`}>
                <Select
                  value={field.value?.package_id || ''}
                  onValueChange={handlePackageChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePackages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - ${pkg.price || pkg.sale_price || 0}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Portal>
          </div>
        )}

        {field.value?.addons?.length > 0 && (
          <div className="space-y-2">
            <Label>Add-ons</Label>
            <div className="space-y-2">
              {field.value.addons.map((addon: any) => (
                <div key={addon.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <span>{addon.name} - ${addon.price}</span>
                  <input
                    type="checkbox"
                    checked={addon.selected}
                    onChange={(e) => handleAddonToggle(addon.id, e.target.checked)}
                    className="ml-2"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                value={field.value?.quantity || 1}
                onChange={(e) => {
                  const currentItems = form.getValues("service_items") || [];
                  const updatedItems = [...currentItems];
                  updatedItems[index] = {
                    ...updatedItems[index],
                    quantity: parseInt(e.target.value) || 1
                  };
                  form.setValue("service_items", updatedItems, { shouldValidate: true });
                }}
              />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Unit Price</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={field.value?.unit_price || 0}
                onChange={(e) => {
                  const currentItems = form.getValues("service_items") || [];
                  const updatedItems = [...currentItems];
                  updatedItems[index] = {
                    ...updatedItems[index],
                    unit_price: parseFloat(e.target.value) || 0
                  };
                  form.setValue("service_items", updatedItems, { shouldValidate: true });
                }}
              />
            </FormControl>
          </FormItem>
        </div>
      </div>
    </Card>
  );
}
