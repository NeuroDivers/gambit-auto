
import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ServiceType } from "../hooks/useServiceTypes"

interface ServiceCardContentProps {
  service: ServiceType;
  isExpanded: boolean;
}

export const ServiceCardContent = ({ service, isExpanded }: ServiceCardContentProps) => {
  const hasSubServices = service.sub_services && service.sub_services.length > 0;

  return (
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
  );
};
