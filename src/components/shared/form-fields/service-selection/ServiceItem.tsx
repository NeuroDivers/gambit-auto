
import React, { useRef, useEffect, useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(
    services.find(s => s.id === item.service_id)
  );
  const [localQuantity, setLocalQuantity] = useState(item.quantity?.toString() || "1");
  const [localPrice, setLocalPrice] = useState(item.unit_price?.toString() || "0");

  useEffect(() => {
    if (item.service_name) {
      setIsExpanded(true);
    }
    return () => {
      mounted.current = false;
    };
  }, [item.service_name]);

  useEffect(() => {
    const service = services.find(s => s.id === item.service_id);
    if (service) {
      setSelectedService(service);
    }
  }, [item.service_id, services]);

  const handleServiceSelect = React.useCallback((currentValue: string) => {
    if (!mounted.current) return;

    const newSelectedService = services.find(service => service.id === currentValue);
    
    if (newSelectedService) {
      console.log('Selected service:', newSelectedService);
      
      setSelectedService(newSelectedService);
      setOpen(false);

      onUpdate(index, {
        service_id: newSelectedService.id,
        service_name: newSelectedService.name,
        quantity: item.quantity || 1,
        unit_price: newSelectedService.price || 0
      });
      
      setIsExpanded(true);
    }
  }, [services, index, onUpdate, item.quantity]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mounted.current) return;
    const value = e.target.value;
    setLocalQuantity(value);
  };

  const handleQuantityBlur = () => {
    if (!mounted.current) return;
    const value = parseInt(localQuantity) || 1;
    if (value !== item.quantity) {
      console.log('Quantity changed to:', value);
      onUpdate(index, { quantity: value });
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mounted.current) return;
    const value = e.target.value;
    setLocalPrice(value);
  };

  const handlePriceBlur = () => {
    if (!mounted.current) return;
    const value = parseFloat(localPrice) || 0;
    if (value !== item.unit_price) {
      console.log('Price changed to:', value);
      onUpdate(index, { unit_price: value });
    }
  };

  const servicesByType = services.reduce<ServicesByType>((acc, service) => {
    const type = service.hierarchy_type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(service);
    return acc;
  }, {});

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
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={localQuantity}
                    onChange={handleQuantityChange}
                    onBlur={handleQuantityBlur}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`price-${index}`}>Unit Price</Label>
                  <Input
                    id={`price-${index}`}
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    value={localPrice}
                    onChange={handlePriceChange}
                    onBlur={handlePriceBlur}
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
