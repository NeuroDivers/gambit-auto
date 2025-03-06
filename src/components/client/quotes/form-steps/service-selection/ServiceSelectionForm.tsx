
import { ServiceItemType } from "@/types/service-item";
import { Button } from "@/components/ui/button";
import { useQuoteFormContext } from "../../providers/QuoteFormProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField";

export function ServiceSelectionForm() {
  const { formData, updateFormData } = useQuoteFormContext();
  
  // Convert string[] to ServiceItemType[] if needed
  const currentServices = Array.isArray(formData.service_items) 
    ? formData.service_items.map(item => {
        if (typeof item === 'string') {
          // Convert string to a basic ServiceItemType
          return {
            service_id: item,
            service_name: '', // This will be populated when we fetch from API
            quantity: 1,
            unit_price: 0,
            commission_rate: 0,
            commission_type: null
          };
        }
        return item as ServiceItemType;
      })
    : [];

  const handleServicesChange = (updatedServices: ServiceItemType[]) => {
    updateFormData({
      service_items: updatedServices,
    });
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
            services={currentServices}
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
            console.log("Selected services:", formData.service_items);
          }}
        >
          Continue with {currentServices.length} service{currentServices.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
