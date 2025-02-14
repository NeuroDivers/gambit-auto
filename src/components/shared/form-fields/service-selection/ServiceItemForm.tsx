
import React from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { ServiceItemType } from "@/components/work-orders/types"
import { useEffect, useRef, useState } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ServiceItemFormProps {
  index: number;
  item: ServiceItemType;
  services: any[];
  onUpdate: (index: number, field: keyof ServiceItemType, value: any) => void;
  onRemove: () => void;
}

interface ServiceType {
  id: string;
  name: string;
  price: number | null;
  description?: string;
  hierarchy_type?: string;
}

type ServicesByType = {
  [key: string]: ServiceType[];
}

export function ServiceItemForm({ index, item, services = [], onUpdate, onRemove }: ServiceItemFormProps) {
  const mounted = useRef(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState(item.service_name || "");

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // Update selectedServiceName when item.service_name changes
  useEffect(() => {
    setSelectedServiceName(item.service_name || "");
  }, [item.service_name]);

  const handleServiceSelect = (value: string) => {
    console.log("Selected value:", value);
    if (!mounted.current) return;
    
    const selectedService = services.find(service => service?.id === value);
    console.log("Found service:", selectedService);
    
    if (selectedService) {
      onUpdate(index, "service_id", selectedService.id);
      onUpdate(index, "service_name", selectedService.name);
      onUpdate(index, "unit_price", selectedService.price || 0);
      setSelectedServiceName(selectedService.name);
      setIsExpanded(true);
      setOpen(false);
    }
  };

  const selectedService = services.find(service => service?.id === item.service_id);

  // Group services by hierarchy type with proper typing
  const servicesByType = services.reduce<ServicesByType>((acc, service) => {
    const type = service.hierarchy_type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(service);
    return acc;
  }, {});

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
              <div>
                <Label>Service</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedServiceName || "Select a service..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-[400px] p-0" 
                    align="start"
                    sideOffset={4}
                  >
                    <Command>
                      <CommandInput placeholder="Search services..." />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>No services found.</CommandEmpty>
                        {Object.entries(servicesByType).map(([type, typeServices]) => (
                          <CommandGroup key={type} heading={type}>
                            {typeServices.map((service) => (
                              <CommandItem
                                key={service.id}
                                value={service.id}
                                onSelect={(currentValue) => {
                                  console.log("CommandItem selected:", currentValue);
                                  handleServiceSelect(currentValue);
                                }}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{service.name}</span>
                                  {service.price !== null && (
                                    <span className="text-muted-foreground ml-2">
                                      ${service.price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                <Check
                                  className={cn(
                                    "ml-2 h-4 w-4",
                                    selectedService?.id === service.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity || 1}
                    onChange={(e) => {
                      if (mounted.current) {
                        onUpdate(index, "quantity", parseInt(e.target.value) || 1);
                      }
                    }}
                    min={1}
                    className="mt-1"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    value={item.unit_price || 0}
                    onChange={(e) => {
                      if (mounted.current) {
                        onUpdate(index, "unit_price", parseFloat(e.target.value) || 0);
                      }
                    }}
                    min={0}
                    step="0.01"
                    className="mt-1"
                    autoComplete="off"
                  />
                </div>
              </div>

              {selectedService?.description && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {selectedService.description}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
