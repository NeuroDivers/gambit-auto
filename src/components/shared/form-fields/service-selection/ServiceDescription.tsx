
import { ServiceDescriptionProps } from "./types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ServiceDescription({
  selectedServiceId,
  servicesByType,
  expanded,
  onExpandToggle
}: ServiceDescriptionProps) {
  const selectedService = Object.values(servicesByType)
    .flat()
    .find(service => service.id === selectedServiceId);

  if (!selectedService?.description) return null;

  return (
    <div className="mt-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onExpandToggle}
        className="w-full flex justify-between items-center"
      >
        <span>Description</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      {expanded && (
        <div className="mt-2 text-sm text-muted-foreground">
          {selectedService.description}
        </div>
      )}
    </div>
  );
}
