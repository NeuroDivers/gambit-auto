
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import { InvoiceItem } from "../../types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useServiceData } from "@/components/shared/form-fields/service-selection/useServiceData"

type InvoiceItemFormProps = {
  item: InvoiceItem
  index: number
  onUpdate: (index: number, field: keyof InvoiceItem, value: string | number) => void
  onRemove: (index: number) => void
}

export function InvoiceItemForm({ item, index, onUpdate, onRemove }: InvoiceItemFormProps) {
  const { data: services = [] } = useServiceData()

  const handleServiceSelect = (serviceName: string) => {
    const selectedService = services?.find(service => service.name === serviceName)
    if (selectedService) {
      onUpdate(index, "service_name", serviceName)
      onUpdate(index, "description", selectedService.name)
      onUpdate(index, "unit_price", selectedService.price || 0)
    }
  }

  const getServicePackages = (serviceName: string) => {
    const service = services?.find(s => s.name === serviceName)
    return service?.service_packages?.filter(pkg => pkg.status === 'active') || []
  }

  const handlePackageSelect = (packageId: string) => {
    const selectedService = services?.find(service => 
      service.service_packages?.some(pkg => pkg.id === packageId)
    )
    
    if (selectedService) {
      const selectedPackage = selectedService.service_packages?.find(pkg => pkg.id === packageId)
      if (selectedPackage) {
        onUpdate(index, "service_name", selectedPackage.name)
        onUpdate(index, "description", selectedPackage.description || '')
        onUpdate(index, "unit_price", selectedPackage.price || selectedPackage.sale_price || 0)
      }
    }
  }

  return (
    <div className="relative border rounded-lg p-4 space-y-4 hover:border-primary/50 transition-colors hover:bg-accent/5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="grid gap-4">
        <div>
          <Label>Service</Label>
          <Select
            value={item.service_name}
            onValueChange={handleServiceSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services?.map((service) => (
                <SelectItem key={service.id} value={service.name}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {item.service_name && getServicePackages(item.service_name).length > 0 && (
          <div>
            <Label>Package</Label>
            <Select onValueChange={handlePackageSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                {getServicePackages(item.service_name).map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name} - ${pkg.price || pkg.sale_price || 0}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Description</Label>
          <Textarea
            value={item.description}
            onChange={(e) => onUpdate(index, "description", e.target.value)}
            placeholder="Enter description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => onUpdate(index, "quantity", parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label>Unit Price</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.unit_price}
              onChange={(e) => onUpdate(index, "unit_price", parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
