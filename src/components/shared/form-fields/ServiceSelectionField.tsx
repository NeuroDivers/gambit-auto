
import { ServiceItemType } from "@/types/service-item"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CommissionRateFields } from "@/components/shared/form-fields/CommissionRateFields"
import { Card, CardContent } from "@/components/ui/card"

type ServiceSelectionFieldProps = {
  services: ServiceItemType[]
  onChange: (services: ServiceItemType[]) => void
  onServicesChange?: (services: ServiceItemType[]) => void // For backward compatibility
  disabled?: boolean
  isClient?: boolean
  showCommission?: boolean
  allowPriceEdit?: boolean
  showAssignedStaff?: boolean
}

export function ServiceSelectionField({
  services = [],
  onChange,
  onServicesChange,
  disabled = false,
  isClient = false,
  showCommission = false,
  allowPriceEdit = true,
  showAssignedStaff = false
}: ServiceSelectionFieldProps) {
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({})

  const { data: allServices = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
      if (error) throw error
      return data || []
    }
  })

  const { data: staffProfiles = [] } = useQuery({
    queryKey: ["assignable_staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_view")
        .select("*")
        .eq("status", "active")
      if (error) throw error
      return data || []
    },
    enabled: showAssignedStaff
  })

  const standaloneServices = allServices.filter(service => 
    service.service_type === 'standalone' || 
    service.hierarchy_type === 'main' || 
    !service.parent_service_id
  )
  
  const subServicesByParent: Record<string, typeof allServices> = {}
  allServices.filter(service => 
    service.parent_service_id || 
    service.hierarchy_type === 'sub' || 
    service.service_type === 'addon'
  ).forEach(subService => {
    const parentId = subService.parent_service_id || ''
    if (!subServicesByParent[parentId]) {
      subServicesByParent[parentId] = []
    }
    subServicesByParent[parentId].push(subService)
  })

  const toggleServiceExpanded = (serviceId: string) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }))
  }

  const addService = (serviceId: string) => {
    const service = standaloneServices?.find(s => s.id === serviceId)
    if (!service) return

    const newService: ServiceItemType = {
      service_id: service.id,
      service_name: service.name,
      quantity: 1,
      unit_price: service.base_price || 0,
      commission_rate: 0,
      commission_type: null,
      description: service.description || "",
      is_parent: true,
      sub_services: [],
      assigned_profile_id: null
    }

    onChange([...services, newService])
    
    if (subServicesByParent[service.id]?.length > 0) {
      setExpandedServices(prev => ({
        ...prev,
        [service.id]: true
      }))
    }
  }

  const addSubService = (parentIndex: number, subServiceId: string) => {
    const parentService = services[parentIndex]
    const subService = allServices?.find(s => s.id === subServiceId)
    
    if (!parentService || !subService) return
    
    const updatedServices = [...services]
    
    const existingSubIndex = parentService.sub_services?.findIndex(
      (s: any) => s.service_id === subServiceId
    )
    
    if (existingSubIndex >= 0) return
    
    const newSubService = {
      service_id: subService.id,
      service_name: subService.name,
      quantity: 1,
      unit_price: subService.base_price || 0,
      commission_rate: 0,
      commission_type: null,
      description: subService.description || "",
      parent_id: parentService.service_id,
      assigned_profile_id: null
    }
    
    updatedServices[parentIndex].sub_services = [
      ...(updatedServices[parentIndex].sub_services || []),
      newSubService
    ]
    
    onChange(updatedServices)
  }

  const removeService = (index: number) => {
    const newServices = [...services]
    newServices.splice(index, 1)
    onChange(newServices)
  }

  const removeSubService = (parentIndex: number, subIndex: number) => {
    const updatedServices = [...services]
    updatedServices[parentIndex].sub_services.splice(subIndex, 1)
    onChange(updatedServices)
  }

  const updateService = (index: number, updates: Partial<ServiceItemType>) => {
    const newServices = [...services]
    newServices[index] = { ...newServices[index], ...updates }
    onChange(newServices)
  }

  const updateSubService = (parentIndex: number, subIndex: number, updates: Partial<ServiceItemType>) => {
    const updatedServices = [...services]
    updatedServices[parentIndex].sub_services[subIndex] = {
      ...updatedServices[parentIndex].sub_services[subIndex],
      ...updates
    }
    onChange(updatedServices)
  }

  const handleChange = (newServices: ServiceItemType[]) => {
    onChange(newServices)
    if (onServicesChange) {
      onServicesChange(newServices)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Select
          onValueChange={(value) => addService(value)}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Add service" />
          </SelectTrigger>
          <SelectContent>
            {standaloneServices?.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {services.length > 0 && (
        <div className="space-y-4">
          {services.map((service, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-lg">{service.service_name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                  </div>
                  
                  {subServicesByParent[service.service_id]?.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleServiceExpanded(service.service_id)}
                      className="p-1 h-8"
                    >
                      {expandedServices[service.service_id] ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={service.quantity}
                      onChange={(e) => updateService(index, { quantity: parseInt(e.target.value) || 1 })}
                      className="w-full"
                      disabled={disabled}
                    />
                  </div>
                  {!isClient && allowPriceEdit && (
                    <div>
                      <Label htmlFor={`price-${index}`}>Price</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={service.unit_price}
                        onChange={(e) => updateService(index, { unit_price: parseFloat(e.target.value) || 0 })}
                        className="w-full"
                        disabled={disabled}
                      />
                    </div>
                  )}
                  
                  {showAssignedStaff && (
                    <div className={!isClient && allowPriceEdit ? "sm:col-span-2" : ""}>
                      <Label htmlFor={`staff-${index}`}>Assigned Staff</Label>
                      <Select
                        value={service.assigned_profile_id || ""}
                        onValueChange={(value) => updateService(index, { assigned_profile_id: value || null })}
                        disabled={disabled}
                      >
                        <SelectTrigger id={`staff-${index}`}>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {staffProfiles.map((staff) => (
                            <SelectItem key={staff.profile_id} value={staff.profile_id}>
                              {staff.first_name} {staff.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {showCommission && (
                    <div className="col-span-2">
                      <CommissionRateFields
                        serviceIndex={index}
                        value={{
                          rate: service.commission_rate,
                          type: service.commission_type
                        }}
                        onChange={(value) => updateService(index, {
                          commission_rate: value.rate,
                          commission_type: value.type
                        })}
                        disabled={disabled}
                      />
                    </div>
                  )}
                </div>
                
                {expandedServices[service.service_id] && subServicesByParent[service.service_id]?.length > 0 && (
                  <div className="mb-4 border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Additional Options</h4>
                      <Select
                        onValueChange={(value) => addSubService(index, value)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Add option" />
                        </SelectTrigger>
                        <SelectContent>
                          {subServicesByParent[service.service_id]?.map((subService) => {
                            const alreadyAdded = service.sub_services?.some(
                              (s: any) => s.service_id === subService.id
                            )
                            
                            if (alreadyAdded) return null
                            
                            return (
                              <SelectItem key={subService.id} value={subService.id}>
                                {subService.name}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {service.sub_services && service.sub_services.length > 0 && (
                      <div className="space-y-3 pl-3 border-l-2">
                        {service.sub_services.map((subService: any, subIndex: number) => (
                          <div key={subIndex} className="bg-muted/50 p-3 rounded-md">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium">{subService.service_name}</h5>
                                {subService.description && (
                                  <p className="text-xs text-muted-foreground">{subService.description}</p>
                                )}
                              </div>
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSubService(index, subIndex)}
                                disabled={disabled}
                                className="h-6 p-1"
                              >
                                ✕
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor={`sub-quantity-${index}-${subIndex}`} className="text-xs">Quantity</Label>
                                <Input
                                  id={`sub-quantity-${index}-${subIndex}`}
                                  type="number"
                                  min="1"
                                  value={subService.quantity}
                                  onChange={(e) => updateSubService(index, subIndex, { 
                                    quantity: parseInt(e.target.value) || 1 
                                  })}
                                  className="w-full h-8 text-sm"
                                  disabled={disabled}
                                />
                              </div>
                              {!isClient && allowPriceEdit && (
                                <div>
                                  <Label htmlFor={`sub-price-${index}-${subIndex}`} className="text-xs">Price</Label>
                                  <Input
                                    id={`sub-price-${index}-${subIndex}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={subService.unit_price}
                                    onChange={(e) => updateSubService(index, subIndex, { 
                                      unit_price: parseFloat(e.target.value) || 0 
                                    })}
                                    className="w-full h-8 text-sm"
                                    disabled={disabled}
                                  />
                                </div>
                              )}
                              
                              {showAssignedStaff && (
                                <div className={!isClient && allowPriceEdit ? "sm:col-span-2" : ""}>
                                  <Label htmlFor={`sub-staff-${index}-${subIndex}`} className="text-xs">Assigned Staff</Label>
                                  <Select
                                    value={subService.assigned_profile_id || ""}
                                    onValueChange={(value) => updateSubService(index, subIndex, { assigned_profile_id: value || null })}
                                    disabled={disabled}
                                  >
                                    <SelectTrigger id={`sub-staff-${index}-${subIndex}`} className="h-8 text-sm">
                                      <SelectValue placeholder="Select staff member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">None</SelectItem>
                                      {staffProfiles.map((staff) => (
                                        <SelectItem key={staff.profile_id} value={staff.profile_id}>
                                          {staff.first_name} {staff.last_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              
                              {showCommission && (
                                <div className="col-span-2">
                                  <CommissionRateFields
                                    serviceIndex={`${index}-${subIndex}`}
                                    value={{
                                      rate: subService.commission_rate,
                                      type: subService.commission_type
                                    }}
                                    onChange={(value) => updateSubService(index, subIndex, {
                                      commission_rate: value.rate,
                                      commission_type: value.type
                                    })}
                                    disabled={disabled}
                                    isCompact={true}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(index)}
                    disabled={disabled}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
