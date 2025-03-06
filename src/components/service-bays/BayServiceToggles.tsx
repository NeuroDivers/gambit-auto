
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search, Check } from "lucide-react"

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
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>
      
      <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1">
        {filteredServices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 bg-muted/20 rounded-lg">
            No services match your search
          </p>
        ) : (
          filteredServices.map(service => {
            const isActive = isServiceActive(service.id);
            
            return (
              <div 
                key={service.id} 
                className={`flex items-center justify-between p-2.5 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 hover:bg-primary/15' 
                    : 'hover:bg-muted/30'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`font-medium ${isActive ? 'text-primary' : ''}`}>{service.name}</span>
                  {service.status && (
                    <Badge 
                      variant={service.status === 'active' ? 'success' : 'outline'} 
                      className="w-fit mt-1 text-xs px-1.5 py-0"
                    >
                      {service.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1.5">
                  {isActive && (
                    <Check className="h-3.5 w-3.5 text-green-600 mr-1" />
                  )}
                  <Switch 
                    checked={isActive}
                    onCheckedChange={(checked) => onToggleService(service.id, checked)}
                    className={isActive ? 'bg-primary' : ''}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
