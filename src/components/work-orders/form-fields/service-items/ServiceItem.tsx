
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

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

  const updateServiceItems = (updates: any) => {
    const currentItems = form.getValues("service_items") || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      ...updates
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
          <FormField
            control={form.control}
            name={`service_items.${index}.service_id`}
            render={({ field: serviceField }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <Select
                  value={serviceField.value || ''}
                  onValueChange={(value) => {
                    const service = services.find(s => s.id === value);
                    if (service) {
                      updateServiceItems({
                        service_id: value,
                        service_name: service.name,
                        unit_price: service.price || 0,
                        package_id: null,
                        package_name: null
                      });
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service">
                        {selectedService?.name || "Select a service"}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {availablePackages.length > 0 && (
            <FormField
              control={form.control}
              name={`service_items.${index}.package_id`}
              render={({ field: packageField }) => (
                <FormItem>
                  <FormLabel>Package</FormLabel>
                  <Select
                    value={packageField.value || ''}
                    onValueChange={(value) => {
                      const pkg = availablePackages.find(p => p.id === value);
                      if (pkg) {
                        updateServiceItems({
                          package_id: value,
                          package_name: pkg.name,
                          service_name: pkg.name,
                          unit_price: pkg.price || pkg.sale_price || 0
                        });
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a package">
                          {field.value?.package_name || "Select a package"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePackages.map((pkg: any) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} {pkg.price ? `- $${pkg.price}` : pkg.sale_price ? `- $${pkg.sale_price}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name={`service_items.${index}.quantity`}
            render={({ field: quantityField }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={quantityField.value || 0}
                    onChange={(e) => {
                      updateServiceItems({
                        quantity: parseInt(e.target.value) || 0
                      });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name={`service_items.${index}.unit_price`}
            render={({ field: priceField }) => (
              <FormItem>
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={priceField.value || 0}
                    onChange={(e) => {
                      updateServiceItems({
                        unit_price: parseFloat(e.target.value) || 0
                      });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
