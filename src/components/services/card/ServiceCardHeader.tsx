
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ServiceType } from "../hooks/useServiceTypes";
import { ServiceTypeBadge } from "../card/ServiceTypeBadge";

interface ServiceCardHeaderProps {
  service: ServiceType;
  hasSubServices: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ServiceCardHeader = ({
  service,
  hasSubServices,
  isExpanded,
  onToggleExpand
}: ServiceCardHeaderProps) => {
  const isSubService = service.service_type === 'sub_service' && service.parent;

  return <CardHeader className="!p-0">
      <div className="flex flex-wrap gap-2 items-start">
        <div className="flex-1 min-w-0 md:p-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg truncate">{service.name}</CardTitle>
            {hasSubServices && <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onToggleExpand}>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {service.status === 'inactive' && (
              <Badge variant="destructive">
                inactive
              </Badge>
            )}
            <ServiceTypeBadge type={service.service_type} />
            {isSubService && <Badge variant="secondary" className="flex items-center gap-1">
                <span>Parent: </span>
                <span className="font-medium">{service.parent.name}</span>
              </Badge>}
          </div>
        </div>
      </div>
    </CardHeader>;
};
