
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
import { ServiceItemType } from "@/types/service-item"

interface Service {
  id: string
  name: string
  description: string
  unit_price: number
  quantity: number
  is_parent?: boolean
  sub_services?: Service[]
  parent_id?: string
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
  services: ServiceItemType[]
  onChange: (services: ServiceItemType[]) => void
  allowPriceEdit?: boolean
  disabled?: boolean
  showCommission?: boolean
}

export function ServiceSelectionField({ 
  services, 
  onChange, 
  allowPriceEdit = true, 
  disabled = false,
  showCommission = false 
}: ServiceSelectionFieldProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [serviceList, setServiceList] = useState<ServiceItemType[]>(services || [])
  
  useEffect(() => {
    setServiceList(services || [])
  }, [services])
  
  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    const updatedServices = serviceList.map(service => 
      service.service_id === serviceId 
        ? { ...service, quantity } 
        : service
    );
    
    setServiceList(updatedServices);
    onChange(updatedServices);
  };
  
  const updateServicePrice = (serviceId: string, priceValue: string) => {
    const updatedServices = serviceList.map(service => 
      service.service_id === serviceId 
        ? { ...service, unit_price: parseFloat(priceValue) || 0 } 
        : service
    );
    
    setServiceList(updatedServices);
    onChange(updatedServices);
  };
  
  const removeService = (serviceId: string) => {
    const updatedServices = serviceList.filter(service => service.service_id !== serviceId);
    setServiceList(updatedServices);
    onChange(updatedServices);
  };
  
  return (
    <div className="space-y-4">
      {serviceList.map((service) => (
        <Card key={service.service_id} className="border">
          <CardHeader className="py-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{service.service_name}</CardTitle>
                {service.description && (
                  <CardDescription className="mt-1">{service.description}</CardDescription>
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
      ))}
      
      {serviceList.length === 0 && (
        <div className="text-center p-6 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No services added yet.</p>
        </div>
      )}
    </div>
  )
}
