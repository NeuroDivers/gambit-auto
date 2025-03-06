
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Clock, DollarSign, Activity } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ServiceType } from "@/integrations/supabase/types/service-types"

interface ServiceTypeCardProps {
  serviceType: ServiceType
  onEdit: () => void
}

export function ServiceTypeCard({ serviceType, onEdit }: ServiceTypeCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{serviceType.name}</CardTitle>
            {serviceType.service_type && (
              <Badge variant={
                serviceType.service_type === "standalone" ? "default" :
                serviceType.service_type === "bundle" ? "outline" : "secondary"
              } className="mt-1">
                {serviceType.service_type === "standalone" ? "Standalone" : 
                 serviceType.service_type === "bundle" ? "Bundle" : "Sub Service"}
              </Badge>
            )}
          </div>
          <Badge variant={serviceType.status === "active" ? "default" : "destructive"}>
            {serviceType.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {serviceType.description || "No description available."}
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="flex items-center gap-1 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{serviceType.base_price ? formatCurrency(serviceType.base_price) : "N/A"}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{serviceType.duration ? `${serviceType.duration} min` : "N/A"}</span>
          </div>
          <div className="flex items-center gap-1 text-sm col-span-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{serviceType.pricing_model?.replace('_', ' ') || "N/A"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  )
}
