
import { Badge } from "@/components/ui/badge"
import { Package, Boxes, CircleDot } from "lucide-react"

interface ServiceTypeBadgeProps {
  type?: 'standalone' | 'sub_service' | 'bundle';
}

export const ServiceTypeBadge = ({ type }: ServiceTypeBadgeProps) => {
  const getServiceTypeIcon = () => {
    switch (type) {
      case 'bundle':
        return <Package className="h-4 w-4" />;
      case 'sub_service':
        return <CircleDot className="h-4 w-4" />;
      default:
        return <Boxes className="h-4 w-4" />;
    }
  };

  const getServiceTypeLabel = () => {
    switch (type) {
      case 'bundle':
        return 'Bundle';
      case 'sub_service':
        return 'Sub Service';
      default:
        return 'Standalone';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className="flex items-center gap-1"
    >
      {getServiceTypeIcon()}
      {getServiceTypeLabel()}
    </Badge>
  );
};
