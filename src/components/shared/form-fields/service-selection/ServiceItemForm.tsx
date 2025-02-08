
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { ServiceItemType } from "@/components/work-orders/types"
import { useEffect } from "react"

interface ServiceItemFormProps {
  index: number
  item: ServiceItemType
  services: any[]
  onUpdate: (index: number, field: keyof ServiceItemType, value: any) => void
  onRemove: () => void
}

export function ServiceItemForm({ index, item, services, onUpdate, onRemove }: ServiceItemFormProps) {
  useEffect(() => {
    if (item.service_name && !item.service_id) {
      const matchingService = services.find(service => 
        service.name === item.service_name || 
        service.service_packages?.some((pkg: any) => pkg.name === item.service_name)
      )
      if (matchingService) {
        onUpdate(index, "service_id", matchingService.id)
      }
    }
  }, [item.service_name, item.service_id, services, index, onUpdate])

  const handleServiceSelect = (serviceId: string) => {
    if (!serviceId) return
    
    const selectedService = services.find(service => service.id === serviceId)
    if (selectedService) {
      onUpdate(index, "service_id", serviceId)
      onUpdate(index, "service_name", selectedService.name)
      onUpdate(index, "unit_price", selectedService.price || 0)
    }
  }

  const handlePackageSelect = (packageId: string) => {
    const selectedService = services.find(service => 
      service.service_packages?.some((pkg: any) => pkg.id === packageId)
    )
    
    if (selectedService) {
      const selectedPackage = selectedService.service_packages.find((pkg: any) => pkg.id === packageId)
      if (selectedPackage) {
        onUpdate(index, "service_id", selectedService.id)
        onUpdate(index, "service_name", selectedPackage.name)
        onUpdate(index, "unit_price", selectedPackage.price || 0)
      }
    }
  }

  const getAvailablePackages = () => {
    if (!item.service_id) return []
    const service = services.find(s => s.id === item.service_id)
    return service?.service_packages?.filter((pkg: any) => pkg.status === 'active') || []
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute right-2 top-2"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Service</Label>
          <Select
            value={item.service_id || undefined}
            onValueChange={handleServiceSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {item.service_id && getAvailablePackages().length > 0 && (
            <div className="mt-2">
              <Label>Package</Label>
              <Select
                value={item.service_name}
                onValueChange={handlePackageSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePackages().map((pkg: any) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} - ${pkg.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => onUpdate(index, "quantity", parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label>Unit Price</Label>
          <Input
            type="number"
            value={item.unit_price}
            onChange={(e) => onUpdate(index, "unit_price", parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  )
}
