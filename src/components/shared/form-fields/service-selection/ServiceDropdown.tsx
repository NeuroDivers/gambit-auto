
import React from 'react';
import { ServiceDropdownProps } from "./types";
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ServiceDropdown: React.FC<ServiceDropdownProps> = ({
  selectedServiceName,
  servicesByType,
  open,
  setOpen,
  handleServiceSelect,
  serviceId
}) => {
  const allServices = [...servicesByType.available];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9"
        >
          {selectedServiceName || "Select service..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search services..." />
          <CommandEmpty>No services found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {allServices.map((service) => (
                <CommandItem
                  key={service.id}
                  value={service.name}
                  onSelect={() => {
                    handleServiceSelect(service.id);
                    setOpen(false);
                  }}
                  className={cn(
                    serviceId === service.id ? "bg-accent" : ""
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      serviceId === service.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {service.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
