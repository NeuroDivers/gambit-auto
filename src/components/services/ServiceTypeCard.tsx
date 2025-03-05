
import { ServiceType } from "./hooks/useServiceTypes";
import { ServiceCardHeader } from "./card/ServiceCardHeader";
import { ServiceCardContent } from "./card/ServiceCardContent";
import { ServiceCardActions } from "./card/ServiceCardActions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface ServiceTypeCardProps {
  service: ServiceType;
  onEdit: () => void;
  onRefetch: () => void;
}

export function ServiceTypeCard({ service, onEdit, onRefetch }: ServiceTypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubServices = service.sub_services && service.sub_services.length > 0;

  return (
    <Card className="overflow-hidden">
      <ServiceCardHeader 
        service={service} 
        hasSubServices={hasSubServices}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
      />
      <ServiceCardContent 
        service={service} 
        isExpanded={isExpanded} 
      />
      
      {/* Visibility badges */}
      <div className="px-6 pb-2 flex flex-wrap gap-2">
        {service.status === 'active' && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        )}
        {service.status === 'inactive' && (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Inactive
          </Badge>
        )}
        {service.visible_on_app && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            App
          </Badge>
        )}
        {service.visible_on_website && (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Website
          </Badge>
        )}
      </div>
      
      <ServiceCardActions 
        serviceId={service.id}
        onEdit={onEdit}
        onRefetch={onRefetch}
      />
    </Card>
  );
}
