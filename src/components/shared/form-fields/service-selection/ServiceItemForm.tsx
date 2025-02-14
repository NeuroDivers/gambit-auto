import React from 'react';
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ServiceItemFormProps, ServicesByType } from "./types"
import { ServiceDropdown } from "./ServiceDropdown"
import { ServiceQuantityPrice } from "./ServiceQuantityPrice"
import { ServiceDescription } from "./ServiceDescription"

export function ServiceItemForm({ index, item, services = [], onUpdate, onRemove }: ServiceItemFormProps) {
  const mounted = useRef(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState(item.service_name || "");

  useEffect(() => {
    if (item.service_name) {
      setSelectedServiceName(item.service_name);
      setIsExpanded(true);
    }
    
    return () => {
      mounted.current = false;
    };
  }, [item.service_name]);

  const handleServiceSelect = React.useCallback((currentValue: string) => {
    if (!mounted.current) return;

    const selectedService = services.find(service => service.id === currentValue);
    
    if (selectedService) {
      console.log('Selected service:', selectedService);
      onUpdate(index, "service_id", selectedService.id);
      onUpdate(index, "service_name", selectedService.name);
      
      // Keep the existing unit price if the selected service has no price
      if (selectedService.price !== null && selectedService.price !== undefined) {
        onUpdate(index, "unit_price", selectedService.price);
      }
      
      setSelectedServiceName(selectedService.name);
      setIsExpanded(true);
      setOpen(false);
    }
  }, [services, index, onUpdate]);

  const servicesByType = services.reduce<ServicesByType>((acc, service) => {
    const type = service.hierarchy_type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(service);
    return acc;
  }, {});

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
            {selectedServiceName || "Select a Service"}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <ServiceDropdown
                selectedServiceName={selectedServiceName}
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
