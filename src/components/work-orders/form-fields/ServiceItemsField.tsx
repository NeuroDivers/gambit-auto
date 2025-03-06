
import { useState, useEffect, useRef } from "react"
import { ServiceItemType } from "@/types/service-item"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StaffSelector } from "@/components/shared/form-fields/StaffSelector"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, Trash2, DollarSign, UserIcon, Package, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ServiceItemsFieldProps {
  value: ServiceItemType[];
  onChange: (services: ServiceItemType[]) => void;
  allowPriceEdit?: boolean;
  showCommission?: boolean;
}

export function ServiceItemsField({ 
  value, 
  onChange, 
  allowPriceEdit = true,
  showCommission = false
}: ServiceItemsFieldProps) {
  const [expandedServices, setExpandedServices] = useState<string[]>([])
  const servicesInitialized = useRef(false)
  
  // Fetch service types
  const { data: serviceTypes = [], isLoading } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, base_price, description, service_type, parent_service_id, status")
        .order("name");
      
      if (error) throw error;
      return data || [];
    }
  });

  // Filter standalone services and sub-services
  const standaloneServices = serviceTypes.filter(s => 
    (s.service_type === 'standalone' || s.service_type === 'bundle') && 
    s.status === 'active'
  );

  // Get sub-services for a given service
  const getSubServices = (serviceId: string) => {
    return serviceTypes.filter(s => 
      s.parent_service_id === serviceId && 
      s.status === 'active'
    );
  };

  // Check if a service has sub-services
  const hasSubServices = (serviceId: string): boolean => {
    return getSubServices(serviceId).length > 0;
  };

  // Add a new service
  const handleAddService = () => {
    if (standaloneServices.length === 0) return;
    
    const defaultService = standaloneServices[0];
    const newService: ServiceItemType = {
      service_id: defaultService.id,
      service_name: defaultService.name,
      quantity: 1,
      unit_price: defaultService.base_price || 0,
      description: defaultService.description || "",
      commission_rate: 0,
      commission_type: null,
      sub_services: []
    };
    
    const updatedServices = [...value, newService];
    onChange(updatedServices);
    
    // Auto-expand if has sub-services
    if (hasSubServices(defaultService.id)) {
      setExpandedServices(prev => [...prev, String(updatedServices.length - 1)]);
    }
  };

  // Update service selection
  const handleServiceChange = (index: number, serviceId: string) => {
    const serviceToUpdate = serviceTypes.find(s => s.id === serviceId);
    if (!serviceToUpdate) return;
    
    const updatedServices = [...value];
    updatedServices[index] = {
      ...updatedServices[index],
      service_id: serviceToUpdate.id,
      service_name: serviceToUpdate.name,
      description: serviceToUpdate.description || "",
      unit_price: serviceToUpdate.base_price || 0,
      sub_services: [] // Clear sub-services when changing main service
    };
    
    onChange(updatedServices);
    
    // Auto-expand if has sub-services
    if (hasSubServices(serviceId)) {
      setExpandedServices(prev => {
        if (!prev.includes(String(index))) {
          return [...prev, String(index)];
        }
        return prev;
      });
    } else {
      setExpandedServices(prev => prev.filter(id => id !== String(index)));
    }
  };

  // Remove a service
  const handleRemoveService = (index: number) => {
    const updatedServices = [...value];
    updatedServices.splice(index, 1);
    onChange(updatedServices);
    
    // Remove from expanded list if needed
    setExpandedServices(prev => prev.filter(id => id !== String(index)));
  };

  // Update service fields
  const handleUpdateService = (index: number, field: keyof ServiceItemType, fieldValue: any) => {
    const updatedServices = [...value];
    updatedServices[index] = { ...updatedServices[index], [field]: fieldValue };
    onChange(updatedServices);
  };

  // Add a sub-service
  const handleAddSubService = (parentIndex: number) => {
    if (!value[parentIndex] || !value[parentIndex].service_id) return;
    
    const parentService = value[parentIndex];
    const availableSubServices = getSubServices(parentService.service_id);
    
    if (availableSubServices.length === 0) return;
    
    const defaultSubService = availableSubServices[0];
    const newSubService: ServiceItemType = {
      service_id: defaultSubService.id,
      service_name: defaultSubService.name,
      quantity: 1,
      unit_price: defaultSubService.base_price || 0,
      description: defaultSubService.description || "",
      commission_rate: 0,
      commission_type: null,
      parent_id: parentService.service_id
    };
    
    const updatedServices = [...value];
    if (!updatedServices[parentIndex].sub_services) {
      updatedServices[parentIndex].sub_services = [];
    }
    
    updatedServices[parentIndex].sub_services!.push(newSubService);
    onChange(updatedServices);
  };

  // Update sub-service
  const handleUpdateSubService = (parentIndex: number, subIndex: number, field: keyof ServiceItemType, fieldValue: any) => {
    const updatedServices = [...value];
    
    if (!updatedServices[parentIndex].sub_services) {
      updatedServices[parentIndex].sub_services = [];
    }
    
    if (updatedServices[parentIndex].sub_services![subIndex]) {
      updatedServices[parentIndex].sub_services![subIndex] = {
        ...updatedServices[parentIndex].sub_services![subIndex],
        [field]: fieldValue
      };
      
      onChange(updatedServices);
    }
  };

  // Update sub-service selection
  const handleSubServiceChange = (parentIndex: number, subIndex: number, serviceId: string) => {
    if (!value[parentIndex] || !value[parentIndex].service_id) return;
    
    const subServiceToUpdate = serviceTypes.find(s => s.id === serviceId);
    if (!subServiceToUpdate) return;
    
    const updatedServices = [...value];
    if (!updatedServices[parentIndex].sub_services) {
      updatedServices[parentIndex].sub_services = [];
    }
    
    if (updatedServices[parentIndex].sub_services![subIndex]) {
      updatedServices[parentIndex].sub_services![subIndex] = {
        ...updatedServices[parentIndex].sub_services![subIndex],
        service_id: subServiceToUpdate.id,
        service_name: subServiceToUpdate.name,
        description: subServiceToUpdate.description || "",
        unit_price: subServiceToUpdate.base_price || 0
      };
      
      onChange(updatedServices);
    }
  };

  // Remove a sub-service
  const handleRemoveSubService = (parentIndex: number, subIndex: number) => {
    const updatedServices = [...value];
    
    if (updatedServices[parentIndex].sub_services) {
      updatedServices[parentIndex].sub_services!.splice(subIndex, 1);
      onChange(updatedServices);
    }
  };

  // Initialize expanded services
  useEffect(() => {
    if (serviceTypes.length > 0 && value.length > 0 && !servicesInitialized.current) {
      const servicesWithSubs: string[] = [];
      
      value.forEach((service, index) => {
        if (service.service_id && hasSubServices(service.service_id)) {
          servicesWithSubs.push(String(index));
        }
      });
      
      if (servicesWithSubs.length > 0) {
        setExpandedServices(servicesWithSubs);
        servicesInitialized.current = true;
      }
    }
  }, [serviceTypes, value]);

  if (isLoading) {
    return <div className="py-8 text-center">Loading services...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Services</h3>
        <Button 
          type="button" 
          onClick={handleAddService}
          size="sm"
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Add Service
        </Button>
      </div>
      
      {value.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center space-y-3">
              <Package className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
              <div className="space-y-1">
                <h3 className="font-medium">No services added</h3>
                <p className="text-sm text-muted-foreground">
                  Add a service to get started
                </p>
              </div>
              <Button 
                type="button" 
                onClick={handleAddService}
                variant="outline"
                className="mt-2"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {value.map((service, index) => (
            <Card key={`service-${index}`} className="overflow-hidden">
              <CardHeader className="bg-muted/30 px-4 py-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-background">
                    {index + 1}
                  </Badge>
                  <Select
                    value={service.service_id}
                    onValueChange={(value) => handleServiceChange(index, value)}
                  >
                    <SelectTrigger className="w-[250px] border-none bg-transparent px-0 font-medium">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {standaloneServices.map((serviceOption) => (
                        <SelectItem key={serviceOption.id} value={serviceOption.id}>
                          {serviceOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveService(index)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span>Remove</span>
                </Button>
              </CardHeader>
              
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
                        handleUpdateService(index, 'quantity', quantity);
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
                          handleUpdateService(index, 'unit_price', price);
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
                      onChange={(value) => handleUpdateService(index, 'assigned_profile_id', value)}
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
                          onValueChange={(value) => handleUpdateService(index, 'commission_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select commission type" />
                          </SelectTrigger>
                          <SelectContent>
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
                              handleUpdateService(index, 'commission_rate', rate);
                            }}
                            className="pl-7"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Only show sub-services section if this service has available sub-services */}
                {service.service_id && hasSubServices(service.service_id) && (
                  <>
                    <Separator className="my-2" />
                    
                    <Accordion 
                      type="multiple" 
                      value={expandedServices}
                      onValueChange={setExpandedServices}
                      className="w-full"
                    >
                      <AccordionItem value={String(index)} className="border-none">
                        <div className="flex items-center justify-between">
                          <AccordionTrigger className="py-1 hover:no-underline">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Sub-Services</span>
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                {getSubServices(service.service_id).length} available
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSubService(index);
                            }}
                          >
                            <PlusCircle className="h-3.5 w-3.5 mr-1" />
                            <span>Add Sub-Service</span>
                          </Button>
                        </div>
                        
                        <AccordionContent className="pt-2">
                          <div className="space-y-3 pl-2 border-l-2 border-primary/20">
                            {service.sub_services && service.sub_services.length > 0 ? (
                              service.sub_services.map((subService, subIndex) => (
                                <Card key={`sub-${index}-${subIndex}`} className="shadow-none bg-muted/30">
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
                                        className="h-7 px-2 text-destructive hover:border-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        <span className="text-xs">Remove</span>
                                      </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                      <div>
                                        <label className="text-xs font-medium block mb-1.5">Service Type</label>
                                        <Select
                                          value={subService.service_id}
                                          onValueChange={(value) => handleSubServiceChange(index, subIndex, value)}
                                        >
                                          <SelectTrigger className="text-sm h-8">
                                            <SelectValue placeholder="Select Sub-Service" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {/* Only show sub-services that belong to this parent service */}
                                            {getSubServices(service.service_id).map((subServiceOption) => (
                                              <SelectItem key={subServiceOption.id} value={subServiceOption.id}>
                                                {subServiceOption.name}
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
                                          onChange={(e) => handleUpdateSubService(index, subIndex, 'service_name', e.target.value)}
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
                                          onChange={(e) => handleUpdateSubService(index, subIndex, 'quantity', parseInt(e.target.value) || 1)}
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
                                            onChange={(e) => handleUpdateSubService(index, subIndex, 'unit_price', parseFloat(e.target.value) || 0)}
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
                                          onChange={(value) => handleUpdateSubService(index, subIndex, 'assigned_profile_id', value)}
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
                                            onValueChange={(value) => handleUpdateSubService(index, subIndex, 'commission_type', value)}
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
                                              onChange={(e) => handleUpdateSubService(index, subIndex, 'commission_rate', parseFloat(e.target.value) || 0)}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))
                            ) : (
                              <div className="p-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-full flex justify-center items-center gap-2 h-14 border-dashed"
                                  onClick={() => handleAddSubService(index)}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                  <span>Add a sub-service</span>
                                </Button>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
