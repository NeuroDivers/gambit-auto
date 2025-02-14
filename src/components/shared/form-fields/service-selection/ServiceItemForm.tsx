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

interface ServicePackage {
  id: string;
  name: string;
  description?: string | null;
  price: number | null;
  sale_price?: number | null;
  status: string;
}

interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number | null;
  status: string;
  hierarchy_type: string;
  parent_service_id?: string | null;
  sort_order?: number | null;
  requires_main_service?: boolean;
  can_be_standalone?: boolean;
  sub_services?: Service[];
  service_packages?: ServicePackage[];
}

interface ServiceItemFormProps {
  index: number
  item: ServiceItemType
  services: Service[]
  onUpdate: (index: number, field: keyof ServiceItemType, value: any) => void
  onRemove: () => void
}

export function ServiceItemForm({ index, item, services = [], onUpdate, onRemove }: ServiceItemFormProps) {
  const mounted = useRef(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // Group services by type for better organization
  const groupedServices = React.useMemo(() => {
    if (!Array.isArray(services)) return {};
    
    return services.reduce<Record<string, Service[]>>((acc, service) => {
      if (!service) return acc;
      
      const type = service.hierarchy_type || 'Other';
      const groupName = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(service);
      return acc;
    }, {});
  }, [services]);

  const handleServiceSelect = (serviceId: string) => {
    if (!serviceId || !mounted.current) return;
    
    const selectedService = services?.find(service => service?.id === serviceId);
    if (selectedService) {
      onUpdate(index, "service_id", serviceId);
      onUpdate(index, "service_name", selectedService.name);
      onUpdate(index, "unit_price", selectedService.price || 0);
      setIsExpanded(true);
      setOpen(false);
    }
  };

  const selectedService = services?.find(service => service?.id === item.service_id);

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

      <Accordion
        type="single"
        collapsible
        value={isExpanded ? "service-details" : ""}
        onValueChange={(value) => setIsExpanded(value === "service-details")}
      >
        <AccordionItem value="service-details" className="border-none">
          <AccordionTrigger className="py-2">
            {selectedService?.name || "Select a Service"}
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
                      {selectedService?.name || "Select a service..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search for a service..." />
                      <CommandEmpty>No service found.</CommandEmpty>
                      {Object.entries(groupedServices).map(([groupName, groupServices]) => (
                        <CommandGroup key={groupName} heading={groupName}>
                          {groupServices.map((service) => (
                            <CommandItem
                              key={service.id}
                              onSelect={() => handleServiceSelect(service.id)}
                              value={service.id}
                              disabled={service.status === 'inactive'}
                              className="flex justify-between items-center"
                            >
                              <span className="flex-1">{service.name}</span>
                              {service.price && (
                                <span className="text-muted-foreground ml-2">
                                  ${service.price.toFixed(2)}
                                </span>
                              )}
                              <Check
                                className={cn(
                                  "ml-2 h-4 w-4 flex-shrink-0",
                                  selectedService?.id === service.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
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
