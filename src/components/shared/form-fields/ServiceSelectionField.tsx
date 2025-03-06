import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ServiceItemType } from "@/types/service-item"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { 
  ChevronDown, 
  ChevronRight, 
  UserIcon, 
  PlusIcon, 
  Trash2Icon, 
  DollarSignIcon,
  InfoIcon 
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StaffSelector } from "./StaffSelector"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

  const standaloneServices = serviceTypes.filter(s => 
    (s.service_type === 'standalone' || s.service_type === 'bundle') &&
    s.status === 'active'
  );

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
    
    const newServices = [...services, newService];
    onChange(newServices);
    
    // If the service has sub-services, open the collapsible immediately
    if (hasSubServices(serviceToAdd.id)) {
      const index = newServices.length - 1;
      setOpenCollapsibles(prev => ({
        ...prev,
        [index]: true
      }));
    }
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

  const hasSubServices = (serviceId: string): boolean => {
    return getSubServices(serviceId).length > 0;
  };

  useEffect(() => {
    services.forEach((service, index) => {
      if (service.service_id && hasSubServices(service.service_id)) {
        console.log("Opening collapsible for service with sub-services:", service.service_name);
        setOpenCollapsibles(prev => ({
          ...prev,
          [index]: true
        }));
      }
    });
  }, [services, serviceTypes]);

  useEffect(() => {
    if (serviceTypes.length > 0) {
      services.forEach((service, index) => {
        if (service.service_id && hasSubServices(service.service_id)) {
          console.log("ServiceTypes loaded, opening collapsible for:", service.service_name);
          setOpenCollapsibles(prev => ({
            ...prev,
            [index]: true
          }));
        }
      });
    }
  }, [serviceTypes]);

  return (
    <div className="space-y-5">
      <div>
        <Select
          onValueChange={handleServiceChange}
        >
          <SelectTrigger className="w-full">
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
            <Card key={index} className="shadow-sm overflow-hidden">
              <div className="bg-muted/40 p-4 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-background">
                      {index + 1}
                    </Badge>
                    <h4 className="font-medium">{service.service_name}</h4>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveService(index)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2Icon className="h-4 w-4 mr-1" />
                    <span>Remove</span>
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4 space-y-4">
                {service.description && (
                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                    {service.description}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Quantity</label>
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
                    <label className="text-sm font-medium block mb-1.5">Unit Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={service.unit_price || ''}
                        onChange={(e) => {
                          const price = parseFloat(e.target.value) || 0;
                          handleItemChange(index, 'unit_price', price);
                        }}
                        disabled={!allowPriceEdit}
                        className="w-full pl-7"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1 mb-1.5">
                      <UserIcon className="h-3.5 w-3.5" />
                      <span>Staff Assignment</span>
                    </label>
                    <StaffSelector
                      value={service.assigned_profile_id || null}
                      onChange={(value) => handleItemChange(index, 'assigned_profile_id', value)}
                      placeholder="Assign staff"
                    />
                  </div>
                </div>
                
                {showCommission && service.assigned_profile_id && (
                  <Card className="border-muted bg-muted/30 shadow-none">
                    <CardContent className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium block mb-1.5">Commission Type</label>
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
                        <label className="text-sm font-medium block mb-1.5">
                          {service.commission_type === 'percentage' ? 'Commission %' : 'Commission Amount'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {service.commission_type === 'percentage' ? '%' : '$'}
                          </span>
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
                            className="pl-7"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {service.service_id && hasSubServices(service.service_id) && (
                  <div className="pt-2 mt-2 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <Button 
                        type="button" 
                        onClick={() => toggleCollapsible(index)}
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary hover:bg-primary/10 flex items-center gap-2"
                      >
                        {openCollapsibles[index] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span>Sub-Services</span>
                        
                        <Badge variant="outline" className="ml-2 bg-primary/10 hover:bg-primary/10 text-xs">
                          {getSubServices(service.service_id).length} available
                        </Badge>
                      </Button>
                      
                      {openCollapsibles[index] && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const subServices = getSubServices(service.service_id);
                            if (subServices.length > 0) {
                              handleAddSubService(index, subServices[0].id);
                            }
                          }}
                          className="flex items-center gap-2 text-xs"
                        >
                          <PlusIcon className="h-3 w-3" />
                          Add Sub-Service
                        </Button>
                      )}
                    </div>
                    
                    {openCollapsibles[index] && (
                      <div className="relative pl-4 ml-1 border-l-2 border-primary/40 space-y-3">
                        {!service.service_id && (
                          <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                            No service selected
                          </div>
                        )}
                        
                        {service.service_id && !hasSubServices(service.service_id) && (
                          <div className="rounded-md bg-muted/50 p-3 text-sm">
                            <div className="flex items-start gap-2">
                              <InfoIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">This service doesn't have any sub-services available</span>
                            </div>
                          </div>
                        )}

                        {service.sub_services && service.sub_services.length > 0 ? (
                          <div className="space-y-3">
                            {service.sub_services.map((subService, subIndex) => (
                              <Card key={subIndex} className="shadow-none bg-muted/30">
                                <CardContent className="p-3 pt-3">
                                  <div className="flex justify-between items-center mb-3">
                                    <Badge variant="outline" className="bg-background">
                                      Sub {subIndex + 1}
                                    </Badge>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveSubService(index, subIndex)}
                                      className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash2Icon className="h-3 w-3 mr-1" />
                                      <span className="text-xs">Remove</span>
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div>
                                      <label className="text-xs font-medium block mb-1.5">Service Type</label>
                                      <Select
                                        value={subService.service_id}
                                        onValueChange={(value) => {
                                          const selectedService = serviceTypes.find(s => s.id === value);
                                          if (selectedService) {
                                            handleSubServiceChange(index, subIndex, 'service_id', value);
                                            handleSubServiceChange(index, subIndex, 'service_name', selectedService.name);
                                            handleSubServiceChange(index, subIndex, 'unit_price', selectedService.base_price || 0);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="text-sm h-8">
                                          <SelectValue placeholder="Select Sub-Service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getSubServices(service.service_id).map((service) => (
                                            <SelectItem key={service.id} value={service.id}>
                                              {service.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div>
                                      <label className="text-xs font-medium block mb-1.5">Service Name</label>
                                      <Input 
                                        className="text-sm h-8" 
                                        placeholder="Sub-Service Name"
                                        value={subService.service_name}
                                        onChange={(e) => handleSubServiceChange(index, subIndex, 'service_name', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div>
                                      <label className="text-xs font-medium block mb-1.5">Quantity</label>
                                      <Input
                                        className="text-sm h-8"
                                        type="number"
                                        min="1"
                                        value={subService.quantity}
                                        onChange={(e) => handleSubServiceChange(index, subIndex, 'quantity', parseInt(e.target.value) || 1)}
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="text-xs font-medium block mb-1.5">Unit Price</label>
                                      <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                        <Input
                                          className="text-sm h-8 pl-5"
                                          type="number"
                                          step="0.01"
                                          value={subService.unit_price || ''}
                                          onChange={(e) => handleSubServiceChange(index, subIndex, 'unit_price', parseFloat(e.target.value) || 0)}
                                          disabled={!allowPriceEdit}
                                        />
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="text-xs font-medium flex items-center gap-1 mb-1.5">
                                        <UserIcon className="h-3 w-3" />
                                        <span>Staff Assignment</span>
                                      </label>
                                      <StaffSelector
                                        value={subService.assigned_profile_id || null}
                                        onChange={(value) => handleSubServiceChange(index, subIndex, 'assigned_profile_id', value)}
                                        placeholder="Assign staff"
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                  
                                  {showCommission && subService.assigned_profile_id && (
                                    <div className="bg-muted/50 rounded-md p-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-xs font-medium block mb-1">Commission Type</label>
                                        <Select
                                          value={subService.commission_type || 'percentage'}
                                          onValueChange={(value) => handleSubServiceChange(index, subIndex, 'commission_type', value)}
                                        >
                                          <SelectTrigger className="text-xs h-7">
                                            <SelectValue placeholder="Select Type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div>
                                        <label className="text-xs font-medium block mb-1">
                                          {subService.commission_type === 'percentage' ? 'Commission %' : 'Commission Amount'}
                                        </label>
                                        <div className="relative">
                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                            {subService.commission_type === 'percentage' ? '%' : '$'}
                                          </span>
                                          <Input
                                            className="h-7 text-xs pl-5"
                                            type="number"
                                            min="0"
                                            step={subService.commission_type === 'percentage' ? "1" : "0.01"}
                                            max={subService.commission_type === 'percentage' ? 100 : undefined}
                                            value={subService.commission_rate || 0}
                                            onChange={(e) => handleSubServiceChange(index, subIndex, 'commission_rate', parseFloat(e.target.value) || 0)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          service.service_id && hasSubServices(service.service_id) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    type="button" 
                                    variant="outline"
                                    size="sm"
                                    className="w-full flex items-center justify-center gap-2 h-16 border-dashed text-muted-foreground hover:text-primary"
                                    onClick={() => {
                                      const subServices = getSubServices(service.service_id);
                                      if (subServices.length > 0) {
                                        handleAddSubService(index, subServices[0].id);
                                      }
                                    }}
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                    <span>Add Sub-Service</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Add additional options to this service</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/40 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-muted-foreground text-center mb-4">
              <p className="mb-2">No services added yet</p>
              <p className="text-sm">Select a service from the dropdown to add it</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
