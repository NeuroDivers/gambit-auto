
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
  const [priceInput, setPriceInput] = React.useState(item.unit_price?.toString() || '0');

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

  useEffect(() => {
    if (item.unit_price !== undefined) {
      setPriceInput(item.unit_price.toString());
    }
  }, [item.unit_price]);

  const handleServiceSelect = React.useCallback((currentValue: string) => {
    if (!mounted.current) return;

    const newSelectedService = services.find(service => service.id === currentValue);
    
    if (newSelectedService) {
      console.log('Selected service:', newSelectedService);
      
      setSelectedService(newSelectedService);
      setOpen(false);

      const updates: Partial<ServiceItemType> = {
        service_id: newSelectedService.id,
        service_name: newSelectedService.name,
        quantity: item.quantity || 1,
        unit_price: newSelectedService.price || 0
      };

      setPriceInput((newSelectedService.price || 0).toString());
      onUpdate(index, updates);
      setIsExpanded(true);
    }
  }, [services, index, onUpdate, item.quantity]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mounted.current) return;
    const value = parseInt(e.target.value) || 1;
    console.log('Quantity changed to:', value);
    onUpdate(index, { quantity: value });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mounted.current) return;
    
    const value = e.target.value;
    console.log('Price input changed to:', value);
    
    setPriceInput(value);
    
    if (value === '' || value === '.') {
      onUpdate(index, { unit_price: 0 });
      return;
    }
    
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      console.log('Updating price to:', numericValue);
      onUpdate(index, { unit_price: numericValue });
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
                    type="number"
                    min={1}
                    value={item.quantity || 1}
                    onChange={handleQuantityChange}
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
                    value={priceInput}
                    onChange={handlePriceChange}
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
