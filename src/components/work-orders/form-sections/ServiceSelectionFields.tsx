
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { useFieldArray } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { Button } from "@/components/ui/button"
import { PlusIcon, Trash2Icon, ChevronDownIcon, ChevronRightIcon, UserIcon, ClipboardCheckIcon, InfoIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StaffSelector } from "@/components/shared/form-fields/StaffSelector"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ServiceItemType } from "@/types/service-item"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ServiceSelectionFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>
}

export function ServiceSelectionFields({ form }: ServiceSelectionFieldsProps) {
  const { fields: serviceItems, append, remove } = useFieldArray({
    control: form.control,
    name: "service_items",
  })

  const [expandedServices, setExpandedServices] = useState<Record<number, boolean>>({})
  const [subServicesByParent, setSubServicesByParent] = useState<Record<string, any[]>>({})

  const toggleService = (index: number) => {
    setExpandedServices(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const { data: serviceTypes } = useQuery({
    queryKey: ["service-types"],
    queryFn: async () => {
      // Only get standalone services that are active
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
        .eq("service_type", "standalone")
        .order("name")

      if (error) throw error
      return data || []
    }
  })

  const { data: subServiceTypes } = useQuery({
    queryKey: ["sub-service-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
        .eq("service_type", "sub_service")
        .order("name")

      if (error) throw error
      
      const subServiceMap: Record<string, any[]> = {};
      data?.forEach(subService => {
        if (subService.parent_service_id) {
          if (!subServiceMap[subService.parent_service_id]) {
            subServiceMap[subService.parent_service_id] = [];
          }
          subServiceMap[subService.parent_service_id].push(subService);
        }
      });
      
      setSubServicesByParent(subServiceMap);
      return data || []
    }
  })

  const hasSubServices = (serviceId: string): boolean => {
    return Boolean(subServicesByParent[serviceId]?.length);
  }

  const addService = () => {
    append({
      service_id: "",
      service_name: "",
      quantity: 1,
      unit_price: 0,
      commission_rate: 0,
      commission_type: "percentage",
      assigned_profile_id: null,
      sub_services: []
    })
  }

  const addSubService = (parentIndex: number) => {
    const updatedServices = [...form.getValues().service_items]
    
    if (!updatedServices[parentIndex].sub_services) {
      updatedServices[parentIndex].sub_services = []
    }
    
    updatedServices[parentIndex].sub_services?.push({
      service_id: "",
      service_name: "",
      quantity: 1,
      unit_price: 0,
      commission_rate: 0,
      commission_type: "percentage",
      assigned_profile_id: null,
      parent_id: updatedServices[parentIndex].service_id
    })
    
    form.setValue("service_items", updatedServices)
  }

  const removeSubService = (parentIndex: number, subIndex: number) => {
    const updatedServices = [...form.getValues().service_items]
    
    if (updatedServices[parentIndex].sub_services) {
      updatedServices[parentIndex].sub_services?.splice(subIndex, 1)
      form.setValue("service_items", updatedServices)
    }
  }

  const handleServiceChange = (index: number, serviceId: string) => {
    const selectedService = serviceTypes?.find(s => s.id === serviceId)
    
    if (selectedService) {
      form.setValue(`service_items.${index}.service_name`, selectedService.name)
      form.setValue(`service_items.${index}.unit_price`, selectedService.base_price || 0)
      form.setValue(`service_items.${index}.service_id`, serviceId)
      
      if (hasSubServices(serviceId)) {
        setExpandedServices(prev => ({
          ...prev,
          [index]: true
        }))
      }
    }
  }

  const handleSubServiceChange = (parentIndex: number, subIndex: number, subServiceId: string) => {
    const selectedSubService = subServiceTypes?.find(s => s.id === subServiceId)
    
    if (selectedSubService) {
      const updatedServices = [...form.getValues().service_items]
      
      if (updatedServices[parentIndex].sub_services && updatedServices[parentIndex].sub_services[subIndex]) {
        updatedServices[parentIndex].sub_services[subIndex].service_id = subServiceId
        updatedServices[parentIndex].sub_services[subIndex].service_name = selectedSubService.name
        updatedServices[parentIndex].sub_services[subIndex].unit_price = selectedSubService.base_price || 0
        
        form.setValue("service_items", updatedServices)
      }
    }
  }

  const updateAssignedStaffForSubService = (parentIndex: number, subIndex: number, profileId: string | null) => {
    const updatedServices = [...form.getValues().service_items]
    
    if (updatedServices[parentIndex].sub_services && updatedServices[parentIndex].sub_services[subIndex]) {
      updatedServices[parentIndex].sub_services[subIndex].assigned_profile_id = profileId
      form.setValue("service_items", updatedServices)
    }
  }

  const getSubServicesForParent = (parentServiceId: string) => {
    if (!parentServiceId) return [];
    return subServicesByParent[parentServiceId] || [];
  }

  useEffect(() => {
    serviceItems.forEach((item, index) => {
      if (item.service_id && hasSubServices(item.service_id)) {
        setExpandedServices(prev => ({
          ...prev,
          [index]: true
        }));
      }
    });
  }, [serviceItems, subServicesByParent]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ClipboardCheckIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Service Items</h3>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={addService}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {serviceItems.length === 0 && (
        <Card className="bg-muted/40 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-muted-foreground text-center mb-4">
              <p className="mb-2">No services added yet</p>
              <p className="text-sm">Add a service to begin creating your work order</p>
            </div>
            <Button 
              type="button" 
              onClick={addService}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Service
            </Button>
          </CardContent>
        </Card>
      )}

      {serviceItems.map((field, index) => (
        <Card key={field.id} className="overflow-hidden border shadow-sm">
          <div className="bg-muted p-4 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-background">
                  {index + 1}
                </Badge>
                <h4 className="font-medium">
                  {field.service_name || "New Service"}
                </h4>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => remove(index)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2Icon className="h-4 w-4 mr-1" />
                <span>Remove</span>
              </Button>
            </div>
          </div>
          
          <CardContent className="p-4 pt-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`service_items.${index}.service_id`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleServiceChange(index, value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Service Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes?.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`service_items.${index}.service_name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Service Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`service_items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`service_items.${index}.unit_price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          className="pl-7"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`service_items.${index}.assigned_profile_id`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Assignment</FormLabel>
                    <FormControl>
                      <StaffSelector 
                        value={field.value} 
                        onChange={field.onChange}
                        placeholder="Assign staff"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {form.watch(`service_items.${index}.assigned_profile_id`) && (
              <Card className="border-muted bg-muted/30 p-3">
                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`service_items.${index}.commission_type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Commission Type</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="flat">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`service_items.${index}.commission_rate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          {form.watch(`service_items.${index}.commission_type`) === 'percentage' 
                            ? 'Commission %' 
                            : 'Commission Amount'}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              {form.watch(`service_items.${index}.commission_type`) === 'percentage' ? '%' : '$'}
                            </span>
                            <Input
                              type="number"
                              min={0}
                              className="pl-7"
                              step={form.watch(`service_items.${index}.commission_type`) === 'percentage' ? "1" : "0.01"}
                              max={form.watch(`service_items.${index}.commission_type`) === 'percentage' ? 100 : undefined}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            <FormField
              control={form.control}
              name={`service_items.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Service description or notes" 
                      className="resize-none" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sub-Services Section */}
            <div className="pt-2 mt-4 border-t">
              <div className="flex justify-between items-center mb-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleService(index)}
                  className="flex items-center gap-2 text-primary hover:text-primary hover:bg-primary/10"
                >
                  {expandedServices[index] ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                  <span>Sub-Services</span>
                  
                  {hasSubServices(field.service_id) && (
                    <Badge variant="outline" className="ml-2 bg-primary/10 hover:bg-primary/10 text-xs">
                      {getSubServicesForParent(field.service_id).length} available
                    </Badge>
                  )}
                </Button>
                
                {expandedServices[index] && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSubService(index)}
                    className="flex items-center gap-2 text-xs"
                  >
                    <PlusIcon className="h-3 w-3" />
                    Add Sub-Service
                  </Button>
                )}
              </div>

              {expandedServices[index] && (
                <div className="relative pl-4 ml-1 border-l-2 border-primary/40 space-y-4">
                  {!field.service_id && (
                    <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                      Please select a service type first to see available sub-services
                    </div>
                  )}
                  
                  {field.service_id && !hasSubServices(field.service_id) && (
                    <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <InfoIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>This service doesn't have any sub-services available</span>
                      </div>
                    </div>
                  )}
                  
                  {field.sub_services && field.sub_services.length > 0 ? (
                    <div className="space-y-3">
                      {field.sub_services.map((subService, subIndex) => (
                        <Card key={subIndex} className="bg-muted/30 shadow-none">
                          <CardContent className="p-3 pt-3">
                            <div className="flex justify-between items-center mb-3">
                              <Badge variant="outline" className="bg-background">
                                Sub {subIndex + 1}
                              </Badge>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeSubService(index, subIndex)}
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
                                  value={(subService as ServiceItemType).service_id}
                                  onValueChange={(value) => handleSubServiceChange(index, subIndex, value)}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Select Sub-Service" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getSubServicesForParent(field.service_id).map((service) => (
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
                                  className="h-8 text-sm" 
                                  placeholder="Sub-Service Name"
                                  value={(subService as ServiceItemType).service_name}
                                  onChange={(e) => {
                                    const updatedServices = [...form.getValues().service_items]
                                    updatedServices[index].sub_services[subIndex].service_name = e.target.value
                                    form.setValue("service_items", updatedServices)
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 mb-3">
                              <div>
                                <label className="text-xs font-medium block mb-1.5">Quantity</label>
                                <Input
                                  className="h-8 text-sm"
                                  type="number"
                                  min={1}
                                  value={(subService as ServiceItemType).quantity}
                                  onChange={(e) => {
                                    const updatedServices = [...form.getValues().service_items]
                                    updatedServices[index].sub_services[subIndex].quantity = parseInt(e.target.value) || 1
                                    form.setValue("service_items", updatedServices)
                                  }}
                                />
                              </div>
                              
                              <div>
                                <label className="text-xs font-medium block mb-1.5">Unit Price</label>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                  <Input
                                    className="h-8 text-sm pl-5"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={(subService as ServiceItemType).unit_price}
                                    onChange={(e) => {
                                      const updatedServices = [...form.getValues().service_items]
                                      updatedServices[index].sub_services[subIndex].unit_price = parseFloat(e.target.value) || 0
                                      form.setValue("service_items", updatedServices)
                                    }}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-xs font-medium flex items-center gap-1 mb-1.5">
                                  <UserIcon className="h-3 w-3" />
                                  <span>Staff Assignment</span>
                                </label>
                                <StaffSelector
                                  value={(subService as ServiceItemType).assigned_profile_id}
                                  onChange={(value) => updateAssignedStaffForSubService(index, subIndex, value)}
                                  placeholder="Assign staff"
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                            
                            {(subService as ServiceItemType).assigned_profile_id && (
                              <div className="bg-muted/50 rounded-md p-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-medium block mb-1">Commission Type</label>
                                  <Select
                                    value={(subService as ServiceItemType).commission_type || 'percentage'}
                                    onValueChange={(value) => {
                                      const updatedServices = [...form.getValues().service_items];
                                      updatedServices[index].sub_services[subIndex].commission_type = value as 'percentage' | 'flat' | null;
                                      form.setValue("service_items", updatedServices);
                                    }}
                                  >
                                    <SelectTrigger className="text-xs h-7">
                                      <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="percentage">Percentage</SelectItem>
                                      <SelectItem value="flat">Fixed Amount</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <label className="text-xs font-medium block mb-1">
                                    {(subService as ServiceItemType).commission_type === 'percentage' 
                                      ? 'Commission %' 
                                      : 'Commission Amount'}
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                      {(subService as ServiceItemType).commission_type === 'percentage' ? '%' : '$'}
                                    </span>
                                    <Input
                                      className="h-7 text-xs pl-5"
                                      type="number"
                                      min={0}
                                      step={(subService as ServiceItemType).commission_type === 'percentage' ? "1" : "0.01"}
                                      max={(subService as ServiceItemType).commission_type === 'percentage' ? 100 : undefined}
                                      value={(subService as ServiceItemType).commission_rate || 0}
                                      onChange={(e) => {
                                        const updatedServices = [...form.getValues().service_items];
                                        updatedServices[index].sub_services[subIndex].commission_rate = parseFloat(e.target.value) || 0;
                                        form.setValue("service_items", updatedServices);
                                      }}
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
                    field.service_id && hasSubServices(field.service_id) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              type="button" 
                              variant="outline"
                              size="sm"
                              className="w-full flex items-center justify-center gap-2 h-20 border-dashed text-muted-foreground hover:text-primary"
                              onClick={() => addSubService(index)}
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
          </CardContent>
        </Card>
      ))}
      
      {serviceItems.length > 0 && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={addService} 
          className="w-full py-6 border-dashed flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Another Service
        </Button>
      )}
    </div>
  )
}
