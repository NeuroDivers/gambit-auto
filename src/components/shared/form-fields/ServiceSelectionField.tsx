
import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ServiceItemType } from "@/types/service-item"
import { useServiceTypes } from "@/hooks/useServiceTypes"
import { ServiceType } from "@/integrations/supabase/types/service-types"
import { toast } from "sonner"

interface ServiceSelectionFieldProps {
  services: ServiceItemType[];
  onChange: (services: ServiceItemType[]) => void;
  allowPriceEdit?: boolean;
  disabled?: boolean;
  showCommission?: boolean;
}

export function ServiceSelectionField({ 
  services, 
  onChange, 
  allowPriceEdit = true, 
  disabled = false,
  showCommission = false 
}: ServiceSelectionFieldProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [serviceList, setServiceList] = useState<ServiceItemType[]>([]);
  
  // Use our custom hook to fetch service types
  const { data: availableServices = [], isLoading, error } = useServiceTypes();
  
  // Update serviceList when services prop changes
  useEffect(() => {
    if (Array.isArray(services)) {
      setServiceList(services);
      console.log("Service list updated:", services.length, "services");
    } else {
      setServiceList([]);
      console.log("Service list reset to empty array");
    }
  }, [services]);
  
  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    if (!serviceId || quantity < 1) return;
    
    const updatedServices = serviceList.map(service => 
      service.service_id === serviceId 
        ? { ...service, quantity } 
        : service
    );
    
    setServiceList(updatedServices);
    onChange(updatedServices);
  };
  
  const updateServicePrice = (serviceId: string, priceValue: string) => {
    if (!serviceId) return;
    
    const updatedServices = serviceList.map(service => 
      service.service_id === serviceId 
        ? { ...service, unit_price: parseFloat(priceValue) || 0 } 
        : service
    );
    
    setServiceList(updatedServices);
    onChange(updatedServices);
  };
  
  const removeService = (serviceId: string) => {
    if (!serviceId) return;
    
    const updatedServices = serviceList.filter(service => service.service_id !== serviceId);
    setServiceList(updatedServices);
    onChange(updatedServices);
    toast.success("Service removed");
  };

  const addService = (serviceType: ServiceType) => {
    if (!serviceType || !serviceType.id) {
      console.error("Invalid service type:", serviceType);
      return;
    }
    
    // Check if service already exists in the list
    const exists = serviceList.some(service => service.service_id === serviceType.id);
    
    if (exists) {
      // If exists, increment quantity instead of adding a new one
      const updatedServices = serviceList.map(service => 
        service.service_id === serviceType.id 
          ? { ...service, quantity: service.quantity + 1 } 
          : service
      );
      setServiceList(updatedServices);
      onChange(updatedServices);
      toast.success(`Increased quantity for ${serviceType.name}`);
    } else {
      // Add new service
      const newService: ServiceItemType = {
        service_id: serviceType.id,
        service_name: serviceType.name,
        quantity: 1,
        unit_price: serviceType.base_price || 0,
        description: serviceType.description || "",
        commission_rate: 0,
        commission_type: null,
      };
      
      const updatedServices = [...serviceList, newService];
      setServiceList(updatedServices);
      onChange(updatedServices);
      toast.success(`Added ${serviceType.name}`);
    }
    
    setOpen(false);
  };
  
  return (
    <div className="space-y-4">
      {/* Service selection dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span>Select service...</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          {isLoading ? (
            <div className="py-6 text-center text-sm flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading services...
            </div>
          ) : error ? (
            <div className="py-6 text-center text-sm text-destructive">
              Error loading services
            </div>
          ) : !Array.isArray(availableServices) || availableServices.length === 0 ? (
            <div className="py-6 text-center text-sm">No services available</div>
          ) : (
            <Command>
              <CommandInput
                placeholder="Search services..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              
              <CommandEmpty>No services found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-72">
                  {availableServices.map((service) => (
                    <CommandItem
                      key={service.id}
                      value={service.name}
                      onSelect={() => addService(service)}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              serviceList.some(s => s.service_id === service.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span>{service.name}</span>
                        </div>
                        {service.description && (
                          <span className="text-muted-foreground text-xs ml-6 mt-1">
                            {service.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </Command>
          )}
        </PopoverContent>
      </Popover>

      {Array.isArray(serviceList) && serviceList.length > 0 ? (
        serviceList.map((service) => (
          <Card key={service.service_id} className="border">
            <CardHeader className="py-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.service_name}</CardTitle>
                  {service.description && (
                    <div className="mt-1 text-sm text-muted-foreground">{service.description}</div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive" 
                  onClick={() => removeService(service.service_id)}
                  disabled={disabled}
                >
                  Remove
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor={`quantity-${service.service_id}`}>Quantity</Label>
                <Input
                  id={`quantity-${service.service_id}`}
                  type="number"
                  min="1"
                  value={service.quantity}
                  onChange={(e) => updateServiceQuantity(service.service_id, parseInt(e.target.value) || 1)}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`unit_price-${service.service_id}`}>Unit Price</Label>
                <Input
                  id={`unit_price-${service.service_id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={service.unit_price}
                  onChange={(e) => updateServicePrice(service.service_id, e.target.value)}
                  disabled={disabled || !allowPriceEdit}
                />
              </div>
              
              {showCommission && service.commission_rate !== undefined && (
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Label>Commission Rate: </Label>
                    <span>{service.commission_rate}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center p-6 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No services added yet.</p>
        </div>
      )}
    </div>
  );
}
