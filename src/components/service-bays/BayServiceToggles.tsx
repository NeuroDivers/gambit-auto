
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type BayServiceTogglesProps = {
  availableServices: {
    id: string
    name: string
    status?: 'active' | 'inactive'
  }[]
  activeServices: {
    service_id: string
    name: string
    is_active: boolean
  }[]
  onToggleService: (serviceId: string, isActive: boolean) => void
}

export function BayServiceToggles({ 
  availableServices, 
  activeServices, 
  onToggleService 
}: BayServiceTogglesProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter services based on search query
  const filteredServices = availableServices.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Find if a service is active
  const isServiceActive = (serviceId: string) => {
    const service = activeServices.find(s => s.service_id === serviceId)
    return service?.is_active || false
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {filteredServices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No services match your search
          </p>
        ) : (
          filteredServices.map(service => (
            <div 
              key={service.id} 
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10"
            >
              <div className="flex flex-col">
                <span className="font-medium">{service.name}</span>
                {service.status && (
                  <Badge variant={service.status === 'active' ? 'success' : 'outline'} className="w-fit mt-1">
                    {service.status}
                  </Badge>
                )}
              </div>
              <Switch 
                checked={isServiceActive(service.id)}
                onCheckedChange={(checked) => onToggleService(service.id, checked)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
