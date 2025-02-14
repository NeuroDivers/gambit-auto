import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ChevronDown, ChevronUp, Package, Boxes, CircleDot } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"

type ServiceTypeCardProps = {
  service: {
    id: string
    name: string
    description?: string | null
    price?: number | null
    duration?: number | null
    status: 'active' | 'inactive'
    pricing_model?: 'flat_rate' | 'hourly' | 'variable'
    base_price?: number | null
    service_type: 'standalone' | 'sub_service' | 'bundle'
    sub_services?: any[]
    parent?: {
      id: string
      name: string
      status: 'active' | 'inactive'
    } | null
  }
  onEdit: () => void
  onRefetch: () => void
}

export function ServiceTypeCard({ service, onEdit, onRefetch }: ServiceTypeCardProps) {
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const hasSubServices = service.sub_services && service.sub_services.length > 0

  console.log('Service in card:', service); // Add debugging log

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', service.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Service type deleted successfully",
      })

      onRefetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getServiceTypeIcon = () => {
    switch (service.service_type) {
      case 'bundle':
        return <Package className="h-4 w-4" />;
      case 'sub_service':
        return <CircleDot className="h-4 w-4" />;
      default:
        return <Boxes className="h-4 w-4" />;
    }
  }

  const getServiceTypeLabel = () => {
    switch (service.service_type) {
      case 'bundle':
        return 'Bundle';
      case 'sub_service':
        return 'Sub Service';
      default:
        return 'Standalone';
    }
  }

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-2 items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg truncate">{service.name}</CardTitle>
              {hasSubServices && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                {service.status}
              </Badge>
              <Badge 
                variant="outline" 
                className="flex items-center gap-1"
              >
                {getServiceTypeIcon()}
                {getServiceTypeLabel()}
              </Badge>
              {service.service_type === 'sub_service' && service.parent && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Part of: {service.parent[0]?.name || service.parent.name}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive hover:text-destructive/90"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {service.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm">
            {service.base_price && (
              <span>Base Price: ${service.base_price}</span>
            )}
            {service.duration && (
              <span>Duration: {service.duration} min</span>
            )}
            {service.pricing_model && (
              <Badge variant="outline" className="capitalize">
                {service.pricing_model.replace('_', ' ')}
              </Badge>
            )}
          </div>

          {isExpanded && hasSubServices && (
            <div className="mt-4 space-y-3 pt-3 border-t">
              <h4 className="text-sm font-medium">Sub Services</h4>
              <div className="space-y-2">
                {service.sub_services.map((subService) => (
                  <div
                    key={subService.id}
                    className="p-2 bg-muted rounded-lg flex justify-between items-center"
                  >
                    <span className="text-sm truncate">{subService.name}</span>
                    <Badge variant="secondary" className="text-xs ml-2">
                      {subService.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
