
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { UseFormReturn } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { ServiceType } from "@/integrations/supabase/types/service-types"

type EstimateFormProps = {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
}

export function EstimateForm({ form, onSubmit, isSubmitting }: EstimateFormProps) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [subtotal, setSubtotal] = useState<number>(0)
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [createNewCustomer, setCreateNewCustomer] = useState<boolean>(true)
  const [standaloneServices, setStandaloneServices] = useState<ServiceType[]>([])
  const [subServices, setSubServices] = useState<{[key: string]: ServiceType[]}>({})
  
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, first_name, last_name, email, phone_number")
        .order("last_name", { ascending: true })
      
      if (error) throw error
      return data || []
    }
  })
  
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles", selectedClient],
    enabled: !!selectedClient,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, year, vin")
        .eq("customer_id", selectedClient)
        .order("created_at", { ascending: false })
      
      if (error) throw error
      return data || []
    }
  })
  
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, description, base_price, pricing_model, parent_service_id, service_type")
        .eq("status", "active")
        .order("name", { ascending: true })
      
      if (error) throw error
      
      // Process services to categorize them
      const standaloneServices = data.filter(service => 
        service.service_type === 'standalone' || !service.parent_service_id
      );
      
      // Group sub-services by parent ID
      const subServicesByParent: {[key: string]: ServiceType[]} = {};
      data.filter(service => service.parent_service_id).forEach(subService => {
        if (!subServicesByParent[subService.parent_service_id!]) {
          subServicesByParent[subService.parent_service_id!] = [];
        }
        subServicesByParent[subService.parent_service_id!].push(subService);
      });
      
      setStandaloneServices(standaloneServices);
      setSubServices(subServicesByParent);
      
      return data.map(service => ({
        ...service,
        price: service.base_price
      })) || []
    }
  })
  
  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId)
    form.setValue("client_id", clientId)
    
    // Find the selected client to set customer info
    const selectedClient = clients?.find(client => client.id === clientId)
    if (selectedClient) {
      form.setValue("customer_first_name", selectedClient.first_name)
      form.setValue("customer_last_name", selectedClient.last_name)
      form.setValue("customer_email", selectedClient.email)
      form.setValue("customer_phone", selectedClient.phone_number)
      setCreateNewCustomer(false)
    }
  }
  
  const updateServiceSelection = (serviceId: string, isChecked: boolean) => {
    const service = services?.find(s => s.id === serviceId)
    if (!service) return

    if (isChecked) {
      const updatedServices = [
        ...selectedServices,
        {
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          quantity: 1,
          is_parent: true,
          sub_services: []
        }
      ]
      setSelectedServices(updatedServices)
      form.setValue("services", updatedServices)
    } else {
      const updatedServices = selectedServices.filter(s => s.id !== serviceId)
      setSelectedServices(updatedServices)
      form.setValue("services", updatedServices)
    }
    
    // Recalculate subtotal
    setTimeout(() => calculateSubtotal(), 0)
  }

  const updateSubServiceSelection = (parentServiceId: string, subServiceId: string, isChecked: boolean) => {
    const subService = services?.find(s => s.id === subServiceId)
    if (!subService) return

    const updatedServices = [...selectedServices]
    const parentIndex = updatedServices.findIndex(s => s.id === parentServiceId)
    
    if (parentIndex === -1) return
    
    if (isChecked) {
      // Add the sub-service to the parent
      updatedServices[parentIndex].sub_services = [
        ...(updatedServices[parentIndex].sub_services || []),
        {
          id: subService.id,
          name: subService.name,
          description: subService.description,
          price: subService.price,
          quantity: 1,
          parent_id: parentServiceId
        }
      ]
    } else {
      // Remove the sub-service from the parent
      updatedServices[parentIndex].sub_services = 
        updatedServices[parentIndex].sub_services.filter(s => s.id !== subServiceId)
    }
    
    setSelectedServices(updatedServices)
    form.setValue("services", updatedServices)
    
    // Recalculate subtotal
    setTimeout(() => calculateSubtotal(), 0)
  }
  
  const updateServiceQuantity = (serviceId: string, quantity: number, isSubService = false, parentId?: string) => {
    let updatedServices = [...selectedServices]
    
    if (isSubService && parentId) {
      // Update sub-service quantity
      const parentIndex = updatedServices.findIndex(service => service.id === parentId)
      if (parentIndex !== -1) {
        const subServiceIndex = updatedServices[parentIndex].sub_services.findIndex(
          (s: any) => s.id === serviceId
        )
        if (subServiceIndex !== -1) {
          updatedServices[parentIndex].sub_services[subServiceIndex].quantity = quantity
        }
      }
    } else {
      // Update main service quantity
      updatedServices = updatedServices.map(service => 
        service.id === serviceId ? { ...service, quantity } : service
      )
    }
    
    setSelectedServices(updatedServices)
    form.setValue("services", updatedServices)
    calculateSubtotal()
  }
  
  const updateServicePrice = (serviceId: string, price: number, isSubService = false, parentId?: string) => {
    let updatedServices = [...selectedServices]
    
    if (isSubService && parentId) {
      // Update sub-service price
      const parentIndex = updatedServices.findIndex(service => service.id === parentId)
      if (parentIndex !== -1) {
        const subServiceIndex = updatedServices[parentIndex].sub_services.findIndex(
          (s: any) => s.id === serviceId
        )
        if (subServiceIndex !== -1) {
          updatedServices[parentIndex].sub_services[subServiceIndex].price = price
        }
      }
    } else {
      // Update main service price
      updatedServices = updatedServices.map(service => 
        service.id === serviceId ? { ...service, price } : service
      )
    }
    
    setSelectedServices(updatedServices)
    form.setValue("services", updatedServices)
    calculateSubtotal()
  }
  
  const calculateSubtotal = () => {
    const total = selectedServices.reduce((sum, service) => {
      // Calculate main service total
      const mainServiceTotal = service.quantity * service.price
      
      // Calculate sub-services total if any
      const subServicesTotal = service.sub_services ? 
        service.sub_services.reduce((subSum: number, subService: any) => {
          return subSum + (subService.quantity * subService.price)
        }, 0) : 0
      
      return sum + mainServiceTotal + subServicesTotal
    }, 0)
    
    setSubtotal(total)
    form.setValue("total", total)
  }
  
  // Recalculate when services change
  useEffect(() => {
    calculateSubtotal()
  }, [selectedServices])

  const handleFormSubmit = (data: any) => {
    if (createNewCustomer) {
      // If creating new customer, make sure all required fields are filled
      if (!data.customer_first_name || !data.customer_last_name || !data.customer_email) {
        toast.error("Please fill in all required customer information")
        return
      }
    }
    
    // Flatten the services array to include both parent and sub-services
    const flattenedServices = selectedServices.flatMap(service => {
      const mainService = {
        id: service.id,
        service_id: service.id,
        service_name: service.name,
        description: service.description,
        quantity: service.quantity,
        unit_price: service.price
      }
      
      const subServices = service.sub_services?.map((subService: any) => ({
        id: subService.id,
        service_id: subService.id,
        service_name: subService.name,
        description: subService.description,
        quantity: subService.quantity,
        unit_price: subService.price,
        parent_service_id: service.id
      })) || []
      
      return [mainService, ...subServices]
    })
    
    // Update the services in the form data
    data.services = flattenedServices
    
    // Add createNewCustomer flag to the data
    data.createNewCustomer = createNewCustomer
    
    onSubmit(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimate Information</CardTitle>
      </CardHeader>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client_id">Client</Label>
            <Select 
              onValueChange={handleClientChange}
              defaultValue={form.watch("client_id")}
            >
              <SelectTrigger id="client_id">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="createNewCustomer" 
                checked={createNewCustomer}
                onCheckedChange={(checked) => setCreateNewCustomer(checked as boolean)}
              />
              <label
                htmlFor="createNewCustomer"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Create new customer
              </label>
            </div>
          </div>
          
          {/* Customer Information - Always visible now */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_first_name">First Name</Label>
              <Input
                id="customer_first_name"
                {...form.register("customer_first_name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_last_name">Last Name</Label>
              <Input
                id="customer_last_name"
                {...form.register("customer_last_name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_email">Email</Label>
              <Input
                id="customer_email"
                {...form.register("customer_email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone</Label>
              <Input
                id="customer_phone"
                {...form.register("customer_phone")}
              />
            </div>
          </div>
          
          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label htmlFor="vehicle_id">Vehicle</Label>
            <Select 
              onValueChange={(value) => {
                form.setValue("vehicle_id", value)
                // Set vehicle information
                const selectedVehicle = vehicles?.find(vehicle => vehicle.id === value)
                if (selectedVehicle) {
                  form.setValue("vehicle_make", selectedVehicle.make)
                  form.setValue("vehicle_model", selectedVehicle.model)
                  form.setValue("vehicle_year", selectedVehicle.year)
                  form.setValue("vehicle_vin", selectedVehicle.vin)
                }
              }}
              defaultValue={form.watch("vehicle_id")}
              disabled={!selectedClient || vehiclesLoading}
            >
              <SelectTrigger id="vehicle_id">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles?.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Vehicle Information - Always visible now */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_make">Make</Label>
              <Input
                id="vehicle_make"
                {...form.register("vehicle_make")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_model">Model</Label>
              <Input
                id="vehicle_model"
                {...form.register("vehicle_model")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_year">Year</Label>
              <Input
                id="vehicle_year"
                {...form.register("vehicle_year")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_vin">VIN</Label>
              <Input
                id="vehicle_vin"
                {...form.register("vehicle_vin")}
              />
            </div>
          </div>
          
          {/* Services Selection */}
          <div className="space-y-4">
            <Label>Services</Label>
            {servicesLoading ? (
              <div>Loading services...</div>
            ) : (
              <div className="space-y-4">
                {/* Display only standalone services first */}
                {standaloneServices.map((service) => (
                  <div key={service.id} className="flex flex-col p-3 border rounded-md">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={`service-${service.id}`}
                        className="mt-1"
                        onChange={(e) => updateServiceSelection(service.id, e.target.checked)}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <label htmlFor={`service-${service.id}`} className="font-medium">
                            {service.name}
                          </label>
                          <div className="text-muted-foreground">
                            Base price: ${service.base_price}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Service quantity and price input fields (visible when service is selected) */}
                    {selectedServices.some(s => s.id === service.id) && (
                      <div className="mt-3 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`quantity-${service.id}`}>Quantity</Label>
                            <Input
                              id={`quantity-${service.id}`}
                              type="number"
                              min="1"
                              defaultValue="1"
                              onChange={(e) => updateServiceQuantity(service.id, parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`price-${service.id}`}>Price</Label>
                            <Input
                              id={`price-${service.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              defaultValue={service.base_price}
                              onChange={(e) => updateServicePrice(service.id, parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        
                        {/* Sub-services selection (if available) */}
                        {subServices[service.id] && subServices[service.id].length > 0 && (
                          <div className="pl-6 mt-2 border-l-2 border-gray-200">
                            <h4 className="font-medium mb-2">Additional Options</h4>
                            {subServices[service.id].map(subService => (
                              <div key={subService.id} className="flex flex-col p-2 mb-2 border rounded-md">
                                <div className="flex items-start space-x-3">
                                  <input
                                    type="checkbox"
                                    id={`sub-service-${subService.id}`}
                                    className="mt-1"
                                    onChange={(e) => updateSubServiceSelection(service.id, subService.id, e.target.checked)}
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between">
                                      <label htmlFor={`sub-service-${subService.id}`} className="font-medium">
                                        {subService.name}
                                      </label>
                                      <div className="text-muted-foreground">
                                        Base price: ${subService.base_price}
                                      </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {subService.description}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Sub-service quantity and price (visible when selected) */}
                                {selectedServices.some(s => 
                                  s.id === service.id && 
                                  s.sub_services && 
                                  s.sub_services.some((sub: any) => sub.id === subService.id)
                                ) && (
                                  <div className="mt-3 grid grid-cols-2 gap-3">
                                    <div>
                                      <Label htmlFor={`sub-quantity-${subService.id}`}>Quantity</Label>
                                      <Input
                                        id={`sub-quantity-${subService.id}`}
                                        type="number"
                                        min="1"
                                        defaultValue="1"
                                        onChange={(e) => updateServiceQuantity(
                                          subService.id, 
                                          parseInt(e.target.value) || 1,
                                          true,
                                          service.id
                                        )}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`sub-price-${subService.id}`}>Price</Label>
                                      <Input
                                        id={`sub-price-${subService.id}`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        defaultValue={subService.base_price}
                                        onChange={(e) => updateServicePrice(
                                          subService.id, 
                                          parseFloat(e.target.value) || 0,
                                          true,
                                          service.id
                                        )}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Total */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label className="text-lg">Total:</Label>
              <div className="text-xl font-bold">${subtotal.toFixed(2)}</div>
            </div>
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for this estimate"
              {...form.register("notes")}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Estimate"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
