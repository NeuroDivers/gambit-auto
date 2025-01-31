import { Edit, Check, X, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ServiceTypeDialog } from "./ServiceTypeDialog";

interface ServiceType {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  description: string | null;
  price: number | null;
  duration: number | null;
}

interface ServiceTypeCardProps {
  service: ServiceType;
  onRefetch: () => void;
  onEdit: () => void;
}

export const ServiceTypeCard = ({ service, onRefetch }: ServiceTypeCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <div className="bg-[#242424] border border-white/12 rounded-lg p-6 transition-all duration-200 hover:border-[#BB86FC]/50">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-white/[0.87]">{service.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-white/60 hover:text-white/[0.87] hover:bg-white/[0.08] transition-colors duration-200"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center text-sm">
            {service.status === 'active' ? (
              <span className="flex items-center text-[#03DAC5]">
                <Check className="w-4 h-4 mr-1" />
                Active
              </span>
            ) : (
              <span className="flex items-center text-white/40">
                <X className="w-4 h-4 mr-1" />
                Inactive
              </span>
            )}
          </div>

          {service.description && (
            <p className="text-sm text-white/60">{service.description}</p>
          )}

          <div className="flex flex-wrap gap-4">
            {service.price && (
              <div className="flex items-center text-sm text-white/[0.87]">
                <DollarSign className="w-4 h-4 mr-1 text-[#BB86FC]" />
                {service.price.toFixed(2)}
              </div>
            )}
            {service.duration && (
              <div className="flex items-center text-sm text-white/[0.87]">
                <Clock className="w-4 h-4 mr-1 text-[#BB86FC]" />
                {service.duration} min
              </div>
            )}
          </div>
        </div>
      </div>

      <ServiceTypeDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        serviceType={service}
        onSuccess={() => {
          setIsEditing(false);
          onRefetch();
        }}
      />
    </>
  );
};