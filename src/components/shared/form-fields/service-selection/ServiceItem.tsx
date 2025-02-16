
import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ServiceItemType } from "@/components/work-orders/types"
import { ServiceDropdown } from "./ServiceDropdown"
import { ServiceQuantityPrice } from "./ServiceQuantityPrice"
import { ServiceDescription } from "./ServiceDescription"
import { ServicesByType } from "./types"

interface ServiceItemProps {
  index: number;
  item: ServiceItemType;
  services: any[];
  onUpdate: (index: number, updates: Partial<ServiceItemType>) => void;
  onRemove: () => void;
}

export function ServiceItem({ index, item, services = [], onUpdate, onRemove }: ServiceItemProps) {
  const mounted = useRef(true);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<any>(
    services.find(s => s.id === item.service_id)
  );

  useEffect(() => {
    if (item.service_name) {
      setIsExpanded(true);
    }
    return () => {
      mounted.current = false;
    };
  }, [item.service_name]);

  // Update selected service when item changes
  useEffect(() => {
    const service = services.find(s => s.id === item.service_id);
    setSelectedService(service);
  }, [item.service_id, services]);

  const handleServiceSelect = React.useCallback((currentValue: string) => {
    if (!mounted.current) return;

    const newSelectedService = services.find(service => service.id === currentValue);
    
    if (newSelectedService) {
      console.log('Selected service:', newSelectedService);

      // Update local state first
      setSelectedService(newSelectedService);

      // Update parent state
      onUpdate(index, {
        service_id: newSelectedService.id,
        service_name: newSelectedService.name,
        unit_price: newSelectedService.price || 0,
        quantity: 1
      });

      setIsExpanded(true);

      console.log('Updated service fields:', {
        service_id: newSelectedService.id,
        service_name: newSelectedService.name,
        unit_price: newSelectedService.price || 0,
        quantity: 1
      });
    }
  }, [services, index, onUpdate]);

  const handleQuantityChange = (value: number) => {
    if (!mounted.current) return;
    onUpdate(index, { quantity: value });
  };

  const handlePriceChange = (value: number) => {
    if (!mounted.current) return;
    onUpdate(index, { unit_price: value });
  };

  // Group services by hierarchy type for better organization
  const servicesByType = services.reduce<ServicesByType>((acc, service) => {
    const type = service.hierarchy_type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(service);
    return acc;
  }, {});

  // Sort services within each type by name
  Object.keys(servicesByType).forEach(type => {
    servicesByType[type].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  });

  return (
    <div className="space-y-4 p-4 border rounded-lg relative bg-card">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute right-2 top-2"
      >
        <X className="h-4 w-4" />
      </Button>

      <Accordion
        type="single"
        collapsible
        value={isExpanded ? "service-details" : ""}
        onValueChange={(value) => setIsExpanded(value === "service-details")}
      >
        <AccordionItem value="service-details" className="border-none">
          <AccordionTrigger className="py-2">
            {item.service_name || "Select a Service"}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <ServiceDropdown
                selectedServiceName={item.service_name || ""}
                servicesByType={servicesByType}
                open={open}
                setOpen={setOpen}
                handleServiceSelect={handleServiceSelect}
                serviceId={item.service_id}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`price-${index}`}>Unit Price</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              <ServiceDescription 
                description={selectedService?.description}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
