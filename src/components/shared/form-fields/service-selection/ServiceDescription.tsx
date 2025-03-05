
import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ServiceDescriptionProps } from './types';

export function ServiceDescription({
  description = "",
  onChange,
  expanded = false,
  onExpandToggle
}: ServiceDescriptionProps) {
  const [localExpanded, setLocalExpanded] = useState(expanded);
  
  const handleToggle = () => {
    const newState = !localExpanded;
    setLocalExpanded(newState);
    if (onExpandToggle) {
      onExpandToggle();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Description</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="h-8 px-2"
        >
          {localExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show
            </>
          )}
        </Button>
      </div>
      
      {localExpanded && (
        <Textarea
          value={description}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder="Enter service description..."
          className="min-h-[100px]"
        />
      )}
    </div>
  );
}
