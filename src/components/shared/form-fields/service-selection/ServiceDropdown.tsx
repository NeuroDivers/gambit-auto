
import { useState, useRef, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceDropdownProps } from "./types";

export function ServiceDropdown({
  service,
  onEdit,
  onRemove,
  selectedServiceName = "",
  servicesByType = {},
  open = false,
  setOpen,
  handleServiceSelect,
  serviceId = ""
}: ServiceDropdownProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const displayName = selectedServiceName || service?.service_name || "Select a service";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
        >
          {displayName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search services..." 
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>No services found.</CommandEmpty>
            {Object.entries(servicesByType).map(([category, services]) => (
              <CommandGroup key={category} heading={category}>
                {Array.isArray(services) && services.map((service) => {
                  const id = service?.id || '';
                  const name = service?.name || '';
                  
                  return (
                    <CommandItem
                      key={id}
                      value={name}
                      onSelect={() => {
                        if (handleServiceSelect) {
                          handleServiceSelect(id);
                          setInputValue("");
                          if (setOpen) setOpen(false);
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          id === serviceId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
