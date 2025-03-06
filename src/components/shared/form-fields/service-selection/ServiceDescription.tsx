
import { ServiceDescriptionProps } from "./types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ServiceDescription({
  description,
  onChange,
  selectedServiceId,
  servicesByType,
  expanded,
  onExpandToggle
}: ServiceDescriptionProps) {
  // Handle the case when used with just description and onChange
  if (description !== undefined && onChange) {
    return null; // Original implementation
  }

  // Handle the case when used with service selection
  if (!selectedServiceId || !servicesByType || expanded === undefined || !onExpandToggle) {
    return null;
  }

  // Find selected service in the servicesByType object
  const selectedService = Object.values(servicesByType)
    .flat()
    .find(service => service && typeof service === 'object' && 'id' in service && service.id === selectedServiceId);

  if (!selectedService || !selectedService.description) return null;

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
