import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { UseFormReturn } from "react-hook-form"

interface Service {
  id: string
  name: string
  description: string
  unit_price: number
  quantity: number
  is_parent?: boolean
  sub_services?: Service[]
}

interface ServiceType {
  id: string
  name: string
  description: string
  base_price: number
  pricing_model: string
  parent_service_id: string | null
  service_type: string
  duration: number
  status: string
  updated_at: string
  created_at: string
}

interface ServiceSelectionFieldProps {
  form: UseFormReturn<any>
  name: string
  services: ServiceType[]
}

export function ServiceSelectionField({ form, name, services }: ServiceSelectionFieldProps) {
  const [open, setOpen] = useState(false)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [isMultiSelect, setIsMultiSelect] = useState(true)

  useEffect(() => {
    // Initialize selected services from form value
    const initialServices = form.getValues(name) || []
    setSelectedServices(initialServices)
  }, [form, name])

  const filteredServices = services.filter((service) => {
    const searchStr = searchValue.toLowerCase()
    return (
      service.name.toLowerCase().includes(searchStr) ||
      service.description.toLowerCase().includes(searchStr)
    )
  })

  const updateServiceSelection = (serviceId: string, isChecked: boolean) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return

    let updatedServices = [...selectedServices]

    if (isChecked) {
      // Add the service to the selected services
      updatedServices = [
        ...updatedServices,
        {
          id: service.id,
          name: service.name,
          description: service.description,
          unit_price: service.base_price,
          quantity: 1,
          is_parent: true,
          sub_services: [],
        },
      ]
    } else {
      // Remove the service from the selected services
      updatedServices = updatedServices.filter((s) => s.id !== serviceId)
    }

    setSelectedServices(updatedServices)

    // Update form value
    form.setValue(name, updatedServices)
  }

  const updateSubServiceSelection = (serviceId: string, subServiceId: string, isChecked: boolean) => {
    const subService = services.find((s) => s.id === subServiceId)
    if (!subService) return

    const updatedServices = [...selectedServices]
    const serviceIndex = updatedServices.findIndex((s) => s.id === serviceId)

    if (serviceIndex === -1) return

    if (isChecked) {
      // Add the sub-service to the parent
      updatedServices[serviceIndex].sub_services = [
        ...(updatedServices[serviceIndex].sub_services || []),
        {
          id: subService.id,
          name: subService.name,
          description: subService.description,
          unit_price: subService.base_price,
          quantity: 1,
          parent_id: serviceId,
        },
      ]
    } else {
      // Remove the sub-service from the parent
      updatedServices[serviceIndex].sub_services = updatedServices[serviceIndex].sub_services.filter((s) => s.id !== subServiceId)
    }

    setSelectedServices(updatedServices)

    // Update form value
    form.setValue(name, updatedServices)
  }

  const updateServiceQuantity = (serviceId: string, quantity: number, isSubService = false, parentId?: string) => {
    let updatedServices = [...selectedServices]

    if (isSubService && parentId) {
      // Update sub-service quantity
      const serviceIndex = updatedServices.findIndex((service) => service.id === parentId)
      if (serviceIndex !== -1) {
        const subServiceIndex = updatedServices[serviceIndex].sub_services.findIndex((s: any) => s.id === serviceId)
        if (subServiceIndex !== -1) {
          updatedServices[serviceIndex].sub_services[subServiceIndex].quantity = quantity
        }
      }
    } else {
      // Update main service quantity
      updatedServices = updatedServices.map((service) =>
        service.id === serviceId ? { ...service, quantity } : service
      )
    }

    setSelectedServices(updatedServices)

    // Update form value
    form.setValue(name, updatedServices)
  }

  const updateServicePrice = (serviceId: string, priceValue: string) => {
    const updatedServices = selectedServices.map(service => 
      service.id === serviceId 
        ? { ...service, unit_price: parseFloat(priceValue) || 0 } 
        : service
    );
    
    setSelectedServices(updatedServices);
    
    // Update form
    if (form) {
      form.setValue(name, updatedServices);
    }
  };

  const updateSubServicePrice = (serviceId: string, subServiceId: string, priceValue: string) => {
    const updatedServices = [...selectedServices];
    const serviceIndex = updatedServices.findIndex(service => service.id === serviceId);
    
    if (serviceIndex !== -1 && updatedServices[serviceIndex].sub_services) {
      const subServiceIndex = updatedServices[serviceIndex].sub_services.findIndex(
        subService => subService.id === subServiceId
      );
      
      if (subServiceIndex !== -1) {
        // Convert string price to number before assignment
        updatedServices[serviceIndex].sub_services[subServiceIndex].unit_price = parseFloat(priceValue) || 0;
        setSelectedServices(updatedServices);
        
        // Update form
        if (form) {
          form.setValue(name, updatedServices);
        }
      }
    }
  };

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-[300px] justify-between",
              selectedServices?.length > 0 ? "bg-muted/50" : " "
            )}
          >
            {selectedServices?.length > 0 ? (
              <>
                {selectedServices.map((service) => service.name).join(", ")}
              </>
            ) : (
              "Select service..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0">
          <Command>
            <CommandInput
              placeholder="Search service..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>No service found.</CommandEmpty>
            <CommandGroup heading="Services">
              {filteredServices.map((service) => {
                const isSelected = selectedServices.some((s) => s.id === service.id)
                return (
                  <CommandItem
                    key={service.id}
                    onSelect={() => {
                      updateServiceSelection(service.id, !isSelected)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {service.name}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedServices.map((service) => (
        <Card key={service.id} className="border-2">
          <CardHeader>
            <CardTitle>{service.name}</CardTitle>
            <CardDescription>{service.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`quantity-${service.id}`}>Quantity</Label>
                <Input
                  id={`quantity-${service.id}`}
                  type="number"
                  min="1"
                  defaultValue={1}
                  onChange={(e) => updateServiceQuantity(service.id, parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`unit_price-${service.id}`}>Unit Price</Label>
                <Input
                  id={`unit_price-${service.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={service.unit_price}
                  onChange={(e) => updateServicePrice(service.id, e.target.value)}
                />
              </div>
            </div>

            {/* Sub-services section */}
            {services
              .filter((s) => s.parent_service_id === service.id)
              .map((subService) => (
                <div key={subService.id} className="pl-4 border-l-2 border-muted">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`sub-service-${subService.id}`}
                      checked={service.sub_services?.some((s) => s.id === subService.id)}
                      onCheckedChange={(isChecked) =>
                        updateSubServiceSelection(service.id, subService.id, isChecked)
                      }
                    />
                    <Label htmlFor={`sub-service-${subService.id}`}>{subService.name}</Label>
                  </div>

                  {/* Sub-service quantity and unit price inputs */}
                  {service.sub_services?.some((s) => s.id === subService.id) && (
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`sub-quantity-${subService.id}`}>Quantity</Label>
                        <Input
                          id={`sub-quantity-${subService.id}`}
                          type="number"
                          min="1"
                          defaultValue={1}
                          onChange={(e) =>
                            updateServiceQuantity(
                              subService.id,
                              parseInt(e.target.value) || 1,
                              true,
                              service.id
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`sub-unit_price-${subService.id}`}>Unit Price</Label>
                        <Input
                          id={`sub-unit_price-${subService.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={subService.base_price}
                          onChange={(e) => updateSubServicePrice(service.id, subService.id, e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
