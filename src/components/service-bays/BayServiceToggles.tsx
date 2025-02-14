
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

type ServiceType = {
  id: string
  name: string
  status?: 'active' | 'inactive'
  hierarchy_type?: string
}

type BayServiceTogglesProps = {
  availableServices: ServiceType[]
  activeServices: {
    service_id: string
    name: string
    is_active: boolean
  }[]
  onToggleService: (serviceId: string, isActive: boolean) => void
}

export function BayServiceToggles({ availableServices, activeServices, onToggleService }: BayServiceTogglesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const activeAvailableServices = availableServices.filter(service => service.status !== 'inactive')

  // Group services by hierarchy type
  const servicesByType = activeAvailableServices.reduce<Record<string, ServiceType[]>>((acc, service) => {
    const type = service.hierarchy_type || 'Other'
    if (!acc[type]) acc[type] = []
    acc[type].push(service)
    return acc
  }, {})

  // Filter services based on search query
  const filteredServicesByType = Object.entries(servicesByType).reduce<Record<string, ServiceType[]>>((acc, [type, services]) => {
    const filteredServices = services.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filteredServices.length > 0) {
      acc[type] = filteredServices
    }
    return acc
  }, {})

  const handleSelectAll = (services: ServiceType[]) => {
    services.forEach(service => {
      if (!activeServices.some(s => s.service_id === service.id)) {
        onToggleService(service.id, true)
      }
    })
  }

  const handleDeselectAll = (services: ServiceType[]) => {
    services.forEach(service => {
      if (activeServices.some(s => s.service_id === service.id)) {
        onToggleService(service.id, false)
      }
    })
  }

  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium">Available Services</Label>
      
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <Accordion type="multiple" className="space-y-2">
        {Object.entries(filteredServicesByType).map(([type, services]) => (
          <AccordionItem 
            key={type} 
            value={type}
            className="border rounded-lg bg-card/50 px-4"
          >
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <span>{type}</span>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSelectAll(services)}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeselectAll(services)}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                {services.map((service) => {
                  const isActive = activeServices.some(s => s.service_id === service.id)
                  return (
                    <div 
                      key={service.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-accent/10 transition-colors"
                    >
                      <span className="text-sm font-medium">{service.name}</span>
                      <Switch
                        checked={isActive}
                        onCheckedChange={(checked) => onToggleService(service.id, checked)}
                      />
                    </div>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {Object.keys(filteredServicesByType).length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No services found matching your search.
        </div>
      )}
    </div>
  )
}
