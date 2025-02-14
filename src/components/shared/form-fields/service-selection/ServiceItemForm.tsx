
import React from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { ServiceItemType } from "@/components/work-orders/types"
import { useEffect, useRef, useState } from "react"
import { SearchableSelect, Option, GroupedOption } from "@/components/shared/form-fields/searchable-select/SearchableSelect"
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

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // Group services by type for better organization and properly type the options
  const groupedServices = (services || []).reduce<Record<string, Option[]>>((acc, service) => {
    const type = service.hierarchy_type || 'Other';
    const groupName = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push({
      value: service.id,
      label: service.name,
      price: service.price,
      disabled: service.status === 'inactive'
    });
    return acc;
  }, {});

  // Transform grouped services into the correct format for SearchableSelect
  const searchableSelectOptions: GroupedOption[] = Object.entries(groupedServices).map(([group, options]) => ({
    label: group,
    options: options
  }));

  const handleServiceSelect = (serviceId: string) => {
    if (!serviceId || !mounted.current) return;
    
    const selectedService = services?.find(service => service.id === serviceId);
    if (selectedService) {
      onUpdate(index, "service_id", serviceId);
      onUpdate(index, "service_name", selectedService.name);
      onUpdate(index, "unit_price", selectedService.price || 0);
      setIsExpanded(true);
    }
  };

  const serviceId = `service_${index}`;
  const quantityId = `quantity_${index}`;
  const priceId = `price_${index}`;

  const selectedService = services?.find(service => service.id === item.service_id);

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
                <Label htmlFor={serviceId}>Service</Label>
                <SearchableSelect
                  options={searchableSelectOptions}
                  value={item.service_id || ''}
                  onValueChange={handleServiceSelect}
                  placeholder="Search for a service..."
                  showPrice={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
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
                    min={1}
                    className="mt-1"
                    autoComplete="off"
                  />
                </div>

                <div>
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
