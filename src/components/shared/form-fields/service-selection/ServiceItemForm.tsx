
import React from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { ServiceItemType } from "@/components/work-orders/types"
import { useEffect, useRef } from "react"

interface ServiceItemFormProps {
  index: number
  item: ServiceItemType
  services: any[]
  onUpdate: (index: number, field: keyof ServiceItemType, value: any) => void
  onRemove: () => void
}

export function ServiceItemForm({ index, item, services, onUpdate, onRemove }: ServiceItemFormProps) {
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mounted.current) return;

    if (item.service_name && !item.service_id) {
      const matchingService = services.find(service => 
        service.name === item.service_name || 
        service.service_packages?.some((pkg: any) => pkg.name === item.service_name)
      );
      if (matchingService) {
        onUpdate(index, "service_id", matchingService.id);
      }
    }
  }, [item.service_name, item.service_id, services, index, onUpdate]);

  const handleServiceSelect = (serviceId: string) => {
    if (!serviceId || !mounted.current) return;
    
    const selectedService = services.find(service => service.id === serviceId);
    if (selectedService) {
      onUpdate(index, "service_id", serviceId);
      onUpdate(index, "service_name", selectedService.name);
      onUpdate(index, "unit_price", selectedService.price || 0);
      // Reset package selection when changing service
      onUpdate(index, "package_id", null);
      onUpdate(index, "package_name", null);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    if (!mounted.current) return;

    const selectedService = services.find(service => service.id === item.service_id);
    if (selectedService && selectedService.service_packages) {
      const selectedPackage = selectedService.service_packages.find((pkg: any) => pkg.id === packageId);
      if (selectedPackage) {
        onUpdate(index, "package_id", selectedPackage.id);
        onUpdate(index, "package_name", selectedPackage.name);
        onUpdate(index, "service_name", selectedPackage.name);
        onUpdate(index, "unit_price", selectedPackage.price || selectedPackage.sale_price || 0);
      }
    }
  };

  const selectedService = services.find(service => service.id === item.service_id);
  const availablePackages = selectedService?.service_packages?.filter((pkg: any) => pkg.status === 'active') || [];

  const serviceId = `service_${index}`;
  const quantityId = `quantity_${index}`;
  const priceId = `price_${index}`;
  const packageId = `package_${index}`;

  // Find the current package if it exists
  const currentPackage = selectedService?.service_packages?.find((pkg: any) => pkg.id === item.package_id);

  return (
    <div className="space-y-4 p-4 border rounded-lg relative bg-card">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute right-2 top-2"
        id={`remove_service_${index}`}
        aria-label={`Remove service ${index + 1}`}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={serviceId}>Service</Label>
          <Select
            value={item.service_id || undefined}
            onValueChange={handleServiceSelect}
          >
            <SelectTrigger id={serviceId} name={serviceId}>
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
              <Label htmlFor={packageId}>Package</Label>
              <Select
                value={item.package_id || undefined}
                onValueChange={handlePackageSelect}
              >
                <SelectTrigger id={packageId} name={packageId}>
                  <SelectValue placeholder="Select a package">
                    {currentPackage?.name}
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
          <Label htmlFor={quantityId}>Quantity</Label>
          <Input
            type="number"
            id={quantityId}
            name={quantityId}
            value={item.quantity}
            onChange={(e) => {
              if (mounted.current) {
                onUpdate(index, "quantity", parseInt(e.target.value) || 0);
              }
            }}
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={priceId}>Unit Price</Label>
          <Input
            type="number"
            id={priceId}
            name={priceId}
            value={item.unit_price}
            onChange={(e) => {
              if (mounted.current) {
                onUpdate(index, "unit_price", parseFloat(e.target.value) || 0);
              }
            }}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
