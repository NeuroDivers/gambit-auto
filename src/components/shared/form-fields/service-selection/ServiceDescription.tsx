
import React from 'react';
import { ServiceDescriptionProps } from "./types";
import { ChevronDown, ChevronUp } from 'lucide-react';

export const ServiceDescription: React.FC<ServiceDescriptionProps> = ({
  service,
  selectedServiceId,
  servicesByType,
  expanded,
  onExpandToggle,
}) => {
  // If a direct service object is provided, use it
  let serviceDetails = service;
  
  // If a selectedServiceId is provided, find the service from the services by type
  if (!serviceDetails && selectedServiceId && servicesByType) {
    const allServices = Object.values(servicesByType).flat();
    serviceDetails = allServices.find(s => s.id === selectedServiceId || 
                                         (s as any).service_id === selectedServiceId);
  }

  if (!serviceDetails) return null;

  // Determine the name and description from the service details
  const displayName = 'service_name' in serviceDetails 
    ? serviceDetails.service_name 
    : 'name' in serviceDetails 
      ? serviceDetails.name 
      : '';

  const description = 'description' in serviceDetails ? serviceDetails.description : '';

  return (
    <div className="mt-2 pb-2 border-b border-dashed">
      <button
        type="button"
        onClick={onExpandToggle}
        className="flex items-center justify-between w-full text-left text-sm mb-1"
      >
        <span className="font-medium">Description</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      
      {expanded && (
        <div className="text-sm text-muted-foreground">
          <p>{description || `No description available for ${displayName}.`}</p>
        </div>
      )}
    </div>
  );
};
