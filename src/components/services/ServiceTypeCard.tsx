
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { ServiceCardHeader } from "./card/ServiceCardHeader"
import { ServiceCardContent } from "./card/ServiceCardContent"
import { ServiceCardActions } from "./card/ServiceCardActions"
import { ServiceType } from "./hooks/useServiceTypes"

type ServiceTypeCardProps = {
  service: ServiceType;
  onEdit: () => void;
  onRefetch: () => void;
}

export function ServiceTypeCard({ service, onEdit, onRefetch }: ServiceTypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubServices = service.sub_services && service.sub_services.length > 0;

  console.log('Service in card:', service);
  console.log('Parent service:', service.parent);

  return (
    <Card className="relative">
      <div className="flex justify-between items-start p-6 pb-3">
        <ServiceCardHeader
          service={service}
          hasSubServices={hasSubServices}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />
        <ServiceCardActions
          serviceId={service.id}
          onEdit={onEdit}
          onRefetch={onRefetch}
        />
      </div>
      <ServiceCardContent
        service={service}
        isExpanded={isExpanded}
      />
    </Card>
  );
}
