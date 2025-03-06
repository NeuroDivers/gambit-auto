
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ServiceItemType } from "@/types/service-item"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Plus, Trash } from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ServiceSelectionFieldProps {
  services: ServiceItemType[];
  onChange: (services: ServiceItemType[]) => void;
  allowPriceEdit?: boolean;
  showCommission?: boolean;
}

export function ServiceSelectionField({ 
  services, 
  onChange, 
  allowPriceEdit = true,
  showCommission = false
}: ServiceSelectionFieldProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  // Fetch service types for dropdown
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["serviceTypesDropdown"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, base_price, description")
        .order("name");
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleAddService = () => {
    if (!selectedServiceId) return;
    
    const serviceToAdd = serviceTypes.find(s => s.id === selectedServiceId);
    if (!serviceToAdd) return;
    
    const newService: ServiceItemType = {
      service_id: serviceToAdd.id,
      service_name: serviceToAdd.name,
      description: serviceToAdd.description || "",
      quantity: 1,
      unit_price: serviceToAdd.base_price || 0,
    };
    
    onChange([...services, newService]);
    setSelectedServiceId(null);
  };

  const handleRemoveService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    onChange(updatedServices);
  };

  const handleItemChange = (index: number, field: keyof ServiceItemType, value: any) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    onChange(updatedServices);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Select
            value={selectedServiceId || ""}
            onValueChange={setSelectedServiceId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              {serviceTypes.map(service => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          type="button" 
          onClick={handleAddService} 
          disabled={!selectedServiceId}
          className="whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {services.length > 0 ? (
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="border rounded-md p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="font-medium">{service.service_name}</div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveService(index)}
                  className="h-8 w-8 p-0"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              {service.description && (
                <div className="text-sm text-muted-foreground">{service.description}</div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={service.quantity}
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value) || 1;
                      handleItemChange(index, 'quantity', quantity);
                    }}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Unit Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={service.unit_price || ''}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0;
                      handleItemChange(index, 'unit_price', price);
                    }}
                    disabled={!allowPriceEdit}
                    className="w-full"
                  />
                </div>
                
                {showCommission && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Commission Type</label>
                      <Select
                        value={service.commission_type || 'percentage'}
                        onValueChange={(value) => handleItemChange(index, 'commission_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select commission type" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">
                        {service.commission_type === 'percentage' ? 'Commission %' : 'Commission Amount'}
                      </label>
                      <Input
                        type="number"
                        step={service.commission_type === 'percentage' ? '1' : '0.01'}
                        min="0"
                        max={service.commission_type === 'percentage' ? '100' : undefined}
                        value={service.commission_rate || ''}
                        onChange={(e) => {
                          const rate = parseFloat(e.target.value) || 0;
                          handleItemChange(index, 'commission_rate', rate);
                        }}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md text-muted-foreground">
          No services added. Select a service and click "Add Service" to get started.
        </div>
      )}
    </div>
  );
}
