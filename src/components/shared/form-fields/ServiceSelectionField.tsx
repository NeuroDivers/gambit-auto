
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ServiceItemType } from "@/types/service-item"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Trash, ChevronDown, ChevronRight, UserCircle } from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StaffSelector } from "./StaffSelector"

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
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<number, boolean>>({});
  const [openAssignments, setOpenAssignments] = useState<Record<number, boolean>>({});
  
  // Fetch service types for dropdown
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["serviceTypesDropdown"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, base_price, description, service_type, parent_service_id, status")
        .order("name");
      
      if (error) throw error;
      return data || [];
    }
  });

  // Filter for standalone services only in the dropdown that are active
  const standaloneServices = serviceTypes.filter(s => 
    (s.service_type === 'standalone' || s.service_type === 'bundle') &&
    s.status === 'active'
  );

  // Get sub-services for a parent service
  const getSubServices = (parentId: string) => {
    return serviceTypes.filter(s => 
      s.parent_service_id === parentId && 
      s.status === 'active'
    );
  };

  const handleServiceChange = (serviceId: string) => {
    if (!serviceId) return;
    
    const serviceToAdd = serviceTypes.find(s => s.id === serviceId);
    if (!serviceToAdd) return;
    
    const newService: ServiceItemType = {
      service_id: serviceToAdd.id,
      service_name: serviceToAdd.name,
      description: serviceToAdd.description || "",
      quantity: 1,
      unit_price: serviceToAdd.base_price || 0,
      commission_rate: 0,
      commission_type: null,
      assigned_profile_id: null,
      is_parent: true,
      sub_services: []
    };
    
    onChange([...services, newService]);
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

  const handleAddSubService = (parentIndex: number, subServiceId: string) => {
    const subService = serviceTypes.find(s => s.id === subServiceId);
    if (!subService) return;

    const updatedServices = [...services];
    if (!updatedServices[parentIndex].sub_services) {
      updatedServices[parentIndex].sub_services = [];
    }

    const newSubService: ServiceItemType = {
      service_id: subService.id,
      service_name: subService.name,
      description: subService.description || "",
      quantity: 1,
      unit_price: subService.base_price || 0,
      commission_rate: 0,
      commission_type: null,
      assigned_profile_id: null,
      parent_id: updatedServices[parentIndex].service_id
    };

    updatedServices[parentIndex].sub_services?.push(newSubService);
    onChange(updatedServices);
  };

  const handleSubServiceChange = (parentIndex: number, subIndex: number, field: keyof ServiceItemType, value: any) => {
    const updatedServices = [...services];
    if (updatedServices[parentIndex].sub_services && updatedServices[parentIndex].sub_services![subIndex]) {
      updatedServices[parentIndex].sub_services![subIndex] = {
        ...updatedServices[parentIndex].sub_services![subIndex],
        [field]: value
      };
      onChange(updatedServices);
    }
  };

  const handleRemoveSubService = (parentIndex: number, subIndex: number) => {
    const updatedServices = [...services];
    if (updatedServices[parentIndex].sub_services) {
      updatedServices[parentIndex].sub_services!.splice(subIndex, 1);
      onChange(updatedServices);
    }
  };

  const toggleCollapsible = (index: number) => {
    setOpenCollapsibles(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleAssignment = (index: number) => {
    setOpenAssignments(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex-1">
        <Select
          onValueChange={handleServiceChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            {standaloneServices.map(service => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

              {/* Staff Assignment Section */}
              <div className="mt-3 pt-2 border-t">
                <div className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-2">
                  <button 
                    type="button" 
                    onClick={() => toggleAssignment(index)}
                    className="flex items-center focus:outline-none"
                  >
                    {openAssignments[index] ? (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-1" />
                    )}
                    <UserCircle className="h-4 w-4 mr-1" />
                    Assign staff member
                  </button>
                </div>
                
                {openAssignments[index] && (
                  <div className="pl-4 border-l-2 border-gray-100 mt-2 mb-4">
                    <div className="mb-3">
                      <label className="text-sm font-medium mb-1 block">Assigned Staff</label>
                      <StaffSelector
                        value={service.assigned_profile_id || null}
                        onChange={(value) => handleItemChange(index, 'assigned_profile_id', value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-services section */}
              <div className="mt-1 pt-2 border-t">
                <div className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-2">
                  <button 
                    type="button" 
                    onClick={() => toggleCollapsible(index)}
                    className="flex items-center focus:outline-none"
                  >
                    {openCollapsibles[index] ? (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-1" />
                    )}
                    Customize with sub-services
                  </button>
                </div>
                
                {openCollapsibles[index] && (
                  <div className="pl-4 border-l-2 border-gray-100 space-y-4 mt-2">
                    {/* Sub-services dropdown */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <Select
                          onValueChange={(value) => handleAddSubService(index, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Add a sub-service" />
                          </SelectTrigger>
                          <SelectContent className="z-[9999]">
                            {getSubServices(service.service_id).map(subService => (
                              <SelectItem key={subService.id} value={subService.id}>
                                {subService.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* List of added sub-services */}
                    {service.sub_services && service.sub_services.length > 0 ? (
                      <div className="space-y-3">
                        {service.sub_services.map((subService, subIndex) => (
                          <div key={subIndex} className="border rounded p-3 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-sm">{subService.service_name}</div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSubService(index, subIndex)}
                                className="h-7 w-7 p-0"
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs font-medium">Quantity</label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={subService.quantity}
                                  onChange={(e) => {
                                    const quantity = parseInt(e.target.value) || 1;
                                    handleSubServiceChange(index, subIndex, 'quantity', quantity);
                                  }}
                                  className="w-full h-8 text-sm"
                                />
                              </div>
                              
                              <div>
                                <label className="text-xs font-medium">Unit Price</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={subService.unit_price || ''}
                                  onChange={(e) => {
                                    const price = parseFloat(e.target.value) || 0;
                                    handleSubServiceChange(index, subIndex, 'unit_price', price);
                                  }}
                                  disabled={!allowPriceEdit}
                                  className="w-full h-8 text-sm"
                                />
                              </div>
                              
                              {/* Sub-service staff assignment */}
                              <div className="md:col-span-2 mt-2">
                                <label className="text-xs font-medium mb-1 block">Assigned Staff</label>
                                <StaffSelector
                                  value={subService.assigned_profile_id || null}
                                  onChange={(value) => handleSubServiceChange(index, subIndex, 'assigned_profile_id', value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground py-2">
                        No sub-services added yet. Select a sub-service from the dropdown to add it.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md text-muted-foreground">
          No services added. Select a service from the dropdown to add it.
        </div>
      )}
    </div>
  );
}
