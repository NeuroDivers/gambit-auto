
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { Button } from "@/components/ui/button"
import { PlusIcon, MinusIcon, ChevronDownIcon, ChevronUpIcon, UsersIcon } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StaffSelector } from "@/components/shared/form-fields/StaffSelector"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ServiceItemType } from "@/types/service-item"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ServiceSelectionFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>
}

export function ServiceSelectionFields({ form }: ServiceSelectionFieldsProps) {
  const { fields: serviceItems, append, remove } = useFieldArray({
    control: form.control,
    name: "service_items",
  })

  const [expandedServices, setExpandedServices] = useState<Record<number, boolean>>({})

  const toggleService = (index: number) => {
    setExpandedServices(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const { data: serviceTypes } = useQuery({
    queryKey: ["service-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
        .in("service_type", ["standalone", "bundle"])
        .order("name")

      if (error) throw error
      return data || []
    }
  })

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

  const handleServiceChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = e.target.value
    const selectedService = serviceTypes?.find(s => s.id === serviceId)
    
    if (selectedService) {
      form.setValue(`service_items.${index}.service_name`, selectedService.name)
      form.setValue(`service_items.${index}.unit_price`, selectedService.base_price || 0)
    }
  }

  const handleSubServiceChange = (parentIndex: number, subIndex: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = e.target.value
    const selectedService = serviceTypes?.find(s => s.id === serviceId)
    
    if (selectedService) {
      const updatedServices = [...form.getValues().service_items]
      
      if (updatedServices[parentIndex].sub_services && updatedServices[parentIndex].sub_services[subIndex]) {
        updatedServices[parentIndex].sub_services[subIndex].service_name = selectedService.name
        updatedServices[parentIndex].sub_services[subIndex].unit_price = selectedService.base_price || 0
        
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

  // Get active sub-services for a parent service
  const getActiveSubServices = (parentServiceId: string) => {
    if (!serviceTypes) return []
    
    return serviceTypes.filter(s => 
      s.parent_service_id === parentServiceId && 
      s.status === 'active' &&
      s.service_type === 'sub_service'
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Service Items</h3>
        <Button 
          type="button" 
          size="sm" 
          onClick={addService}
          variant="outline"
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {serviceItems.length === 0 && (
        <div className="text-center py-8 border rounded-md border-dashed">
          <p className="text-muted-foreground">No services added yet</p>
          <Button 
            type="button" 
            variant="outline"
            className="mt-2"
            onClick={addService}
          >
            Add Service
          </Button>
        </div>
      )}

      {serviceItems.map((field, index) => (
        <div key={field.id} className="border rounded-md p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Service #{index + 1}</h4>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => remove(index)}
              className="text-destructive h-8 px-2"
            >
              <MinusIcon className="h-4 w-4" />
              <span className="ml-1">Remove</span>
            </Button>
          </div>

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
                        const selectedService = serviceTypes?.find(s => s.id === value);
                        if (selectedService) {
                          form.setValue(`service_items.${index}.service_name`, selectedService.name);
                          form.setValue(`service_items.${index}.unit_price`, selectedService.base_price || 0);
                        }
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
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
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
                  <FormLabel className="flex items-center gap-1">
                    <UsersIcon className="h-4 w-4" />
                    Staff Assignment
                  </FormLabel>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`service_items.${index}.commission_type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Commission Type" />
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
                  <FormLabel>
                    {form.watch(`service_items.${index}.commission_type`) === 'percentage' 
                      ? 'Commission %' 
                      : 'Commission Amount'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={form.watch(`service_items.${index}.commission_type`) === 'percentage' ? "1" : "0.01"}
                      max={form.watch(`service_items.${index}.commission_type`) === 'percentage' ? 100 : undefined}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`service_items.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Service description or notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-2">
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-accent-foreground hover:text-accent-foreground hover:bg-accent/50 flex items-center gap-1"
                onClick={() => toggleService(index)}
              >
                {expandedServices[index] ? (
                  <>
                    <ChevronUpIcon className="h-4 w-4 text-accent-foreground" />
                    <span className="text-accent-foreground">Hide Sub-Services</span>
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-4 w-4 text-accent-foreground" />
                    <span className="text-accent-foreground">Customize with Sub-Services</span>
                  </>
                )}
              </Button>
              
              {expandedServices[index] && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSubService(index)}
                  className="flex items-center gap-1"
                >
                  <PlusIcon className="h-3 w-3" />
                  <span>Add Sub-Service</span>
                </Button>
              )}
            </div>

            {expandedServices[index] && (
              <div className="mt-4 pl-4 border-l-2 border-accent">
                <div className="space-y-4">
                  {field.sub_services && field.sub_services.length > 0 ? (
                    field.sub_services.map((subService, subIndex) => (
                      <div key={subIndex} className="border rounded-md p-3 bg-accent/10">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-sm text-accent-foreground">Sub-Service #{subIndex + 1}</h5>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSubService(index, subIndex)}
                            className="text-destructive h-7 px-2"
                          >
                            <MinusIcon className="h-3 w-3" />
                            <span className="ml-1 text-xs">Remove</span>
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Service Type</label>
                            <Select
                              value={(subService as ServiceItemType).service_id}
                              onValueChange={(value) => {
                                const selectedService = serviceTypes?.find(s => s.id === value);
                                if (selectedService) {
                                  const updatedServices = [...form.getValues().service_items];
                                  updatedServices[index].sub_services[subIndex].service_id = value;
                                  updatedServices[index].sub_services[subIndex].service_name = selectedService.name;
                                  updatedServices[index].sub_services[subIndex].unit_price = selectedService.base_price || 0;
                                  form.setValue("service_items", updatedServices);
                                }
                              }}
                            >
                              <SelectTrigger className="w-full text-sm">
                                <SelectValue placeholder="Select Sub-Service" />
                              </SelectTrigger>
                              <SelectContent>
                                {getActiveSubServices(field.service_id).map((service) => (
                                  <SelectItem key={service.id} value={service.id}>
                                    {service.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-1 block">Service Name</label>
                            <Input 
                              className="text-sm" 
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Quantity</label>
                            <Input
                              className="text-sm"
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
                            <label className="text-sm font-medium mb-1 block">Unit Price</label>
                            <Input
                              className="text-sm"
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
                          
                          <div>
                            <label className="text-sm font-medium mb-1 flex items-center gap-1">
                              <UsersIcon className="h-3 w-3 text-accent-foreground" />
                              <span className="text-accent-foreground">Staff Assignment</span>
                            </label>
                            <StaffSelector
                              value={(subService as ServiceItemType).assigned_profile_id}
                              onChange={(value) => updateAssignedStaffForSubService(index, subIndex, value)}
                              placeholder="Assign staff"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Commission Type</label>
                            <Select
                              value={(subService as ServiceItemType).commission_type || 'percentage'}
                              onValueChange={(value) => {
                                const updatedServices = [...form.getValues().service_items];
                                updatedServices[index].sub_services[subIndex].commission_type = value as 'percentage' | 'flat' | null;
                                form.setValue("service_items", updatedServices);
                              }}
                            >
                              <SelectTrigger className="text-sm h-8">
                                <SelectValue placeholder="Select Commission Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="flat">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              {(subService as ServiceItemType).commission_type === 'percentage' 
                                ? 'Commission %' 
                                : 'Commission Amount'}
                            </label>
                            <Input
                              className="text-sm h-8"
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
                    ))
                  ) : (
                    <div className="text-center py-4 border rounded-md border-dashed">
                      <p className="text-muted-foreground text-sm">No sub-services added</p>
                      <Button 
                        type="button" 
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => addSubService(index)}
                      >
                        Add Sub-Service
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
