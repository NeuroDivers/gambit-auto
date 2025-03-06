
import { ServiceItemProps as BaseServiceItemProps } from "@/components/shared/form-fields/service-selection/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ServiceItemProps extends BaseServiceItemProps {
  onRemove: (serviceId: string) => void;
}

export function ServiceItem({ service, onEdit, onRemove }: ServiceItemProps) {
  const handleRemove = () => {
    if (onRemove) {
      onRemove(service.service_id);
    }
  };

  const totalPrice = service.quantity * service.unit_price;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{service.service_name}</h4>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(service)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemove}
            className="h-8 w-8 p-0 text-destructive"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>{service.quantity} × {formatCurrency(service.unit_price)}</span>
          <span className="font-medium text-foreground">{formatCurrency(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
