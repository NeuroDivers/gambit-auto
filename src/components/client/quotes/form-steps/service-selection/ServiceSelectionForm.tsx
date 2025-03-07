
import { ServiceItemType } from "@/types/service-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField";
import { useState } from "react";

interface ServiceSelectionFormProps {
  services?: ServiceItemType[];
  onChange?: (services: ServiceItemType[]) => void;
}

export function ServiceSelectionForm({ services = [], onChange }: ServiceSelectionFormProps) {
  const [selectedServices, setSelectedServices] = useState<ServiceItemType[]>(services);
  
  const handleServicesChange = (updatedServices: ServiceItemType[]) => {
    setSelectedServices(updatedServices);
    if (onChange) {
      onChange(updatedServices);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Service Selection</h2>
        <p className="text-muted-foreground">
          Select the services you're interested in and customize quantities if needed.
        </p>
      </div>
      
      <Separator />
      
      <Card>
        <CardContent className="pt-6">
          <ServiceSelectionField 
            services={selectedServices}
            onChange={handleServicesChange}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={() => {
            console.log("Selected services:", selectedServices);
          }}
        >
          Continue with {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
