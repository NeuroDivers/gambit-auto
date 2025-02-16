
import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
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
  onUpdate: (index: number, field: keyof ServiceItemType, value: any) => void;
  onRemove: () => void;
}

export function ServiceItem({ index, item, services = [], onUpdate, onRemove }: ServiceItemProps) {
  const mounted = useRef(true);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleServiceSelect = React.useCallback((currentValue: string) => {
    if (!mounted.current) return;

    const selectedService = services.find(service => service.id === currentValue);
    
    if (selectedService) {
      console.log('Selected service:', selectedService);

      // Update service_id first
      onUpdate(index, 'service_id', selectedService.id);

      // Update service_name
      onUpdate(index, 'service_name', selectedService.name);

      // Update price
      onUpdate(index, 'unit_price', selectedService.price || 0);

      // Set initial quantity
      onUpdate(index, 'quantity', 1);

      setIsExpanded(true);
      setOpen(false);

      // Log final state for verification
      console.log('Updated service fields:', {
        service_id: selectedService.id,
        service_name: selectedService.name,
        unit_price: selectedService.price || 0,
        quantity: 1
      });
    }
  }, [services, index, onUpdate]);

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

  const selectedService = services.find(s => s.id === item.service_id);

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

              <ServiceQuantityPrice
                index={index}
                item={item}
                onUpdate={onUpdate}
                mounted={mounted}
              />

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
