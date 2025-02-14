
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
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

interface ServiceDropdownProps {
  selectedServiceName: string
  servicesByType: Record<string, Array<{
    id: string
    name: string
    price?: number
  }>>
  open: boolean
  setOpen: (open: boolean) => void
  handleServiceSelect: (serviceId: string) => void
  serviceId: string
}

export function ServiceDropdown({
  selectedServiceName,
  servicesByType,
  open,
  setOpen,
  handleServiceSelect,
  serviceId
}: ServiceDropdownProps) {
  const dropdownId = `service-dropdown-${serviceId || 'new'}`
  
  return (
    <div>
      <Label htmlFor={dropdownId}>Service</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={dropdownId}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left"
          >
            {selectedServiceName}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start" sideOffset={4}>
          <Command>
            <CommandInput placeholder="Search services..." />
            <CommandList>
              <CommandEmpty>No services found.</CommandEmpty>
              {Object.entries(servicesByType).map(([type, services]) => (
                <CommandGroup key={type} heading={type}>
                  {services.map((service) => {
                    const isSelected = service.id === serviceId
                    return (
                      <CommandItem
                        key={service.id}
                        value={service.name}
                        onSelect={() => {
                          console.log("Service selected in dropdown:", service.name);
                          handleServiceSelect(service.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "cursor-pointer",
                          isSelected && "bg-accent"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{service.name}</span>
                          {service.price !== null && service.price !== undefined && (
                            <span className="text-muted-foreground ml-2">
                              ${service.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <Check
                          className={cn(
                            "ml-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
