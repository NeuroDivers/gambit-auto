
import React from 'react';
import { ServiceDescriptionProps } from './types';

export function ServiceDescription({ 
  service, 
  hideDescription = false 
}: ServiceDescriptionProps) {
  if (!service) return null;
  
  return (
    <div className="space-y-1">
      <h4 className="font-medium text-sm">{service.service_name || service.name}</h4>
      
      {!hideDescription && service.description && (
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {service.description}
        </p>
      )}
    </div>
  );
}
