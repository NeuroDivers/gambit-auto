
import { ServiceItemType } from "@/hooks/quote-request/formSchema"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ServiceSelectionFieldProps = {
  services: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
  disabled?: boolean
  isClient?: boolean
}

export function ServiceSelectionField({ 
  services = [],
  onServicesChange,
  disabled = false,
  isClient = false
}: ServiceSelectionFieldProps) {
  const { data: availableServices = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
      if (error) throw error
      return data || []
    }
  })

  const addService = (serviceId: string) => {
    const service = availableServices?.find(s => s.id === serviceId)
    if (!service) return

    const newService: ServiceItemType = {
      service_id: service.id,
      service_name: service.name,
      quantity: 1,
      unit_price: service.base_price || 0
    }

    onServicesChange([...services, newService])
  }

  const removeService = (index: number) => {
    const newServices = [...services]
    newServices.splice(index, 1)
    onServicesChange(newServices)
  }

  const updateQuantity = (index: number, quantity: number) => {
    const newServices = [...services]
    newServices[index] = { ...newServices[index], quantity }
    onServicesChange(newServices)
  }

  const updatePrice = (index: number, price: number) => {
    if (isClient) return // Prevent price updates for clients
    const newServices = [...services]
    newServices[index] = { ...newServices[index], unit_price: price }
    onServicesChange(newServices)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select
          onValueChange={(value) => addService(value)}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Add service" />
          </SelectTrigger>
          <SelectContent>
            {availableServices?.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {services.length > 0 && (
        <div className="space-y-2">
          {services.map((service, index) => (
            <div key={index} className="flex items-center gap-4 p-2 border rounded">
              <div className="flex-1">
                <p className="font-medium">{service.service_name}</p>
                <div className="mt-2 flex gap-4">
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={service.quantity}
                      onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                      className="w-24"
                      disabled={disabled}
                    />
                  </div>
                  {!isClient && (
                    <div>
                      <Label htmlFor={`price-${index}`}>Price</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={service.unit_price}
                        onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                        className="w-24"
                        disabled={disabled}
                      />
                    </div>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeService(index)}
                disabled={disabled}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
