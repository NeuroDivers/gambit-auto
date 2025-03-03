
import { useState } from "react"
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

type EstimateFormProps = {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
}

export function EstimateForm({ form, onSubmit, isSubmitting }: EstimateFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, first_name, last_name, email")
        .order("last_name", { ascending: true })
      
      if (error) throw error
      return data || []
    }
  })
  
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles", selectedCustomer],
    enabled: !!selectedCustomer,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, year, vin")
        .eq("customer_id", selectedCustomer)
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
        .select("id, name, description, price")
        .eq("status", "active")
        .order("name", { ascending: true })
      
      if (error) throw error
      return data || []
    }
  })
  
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId)
    form.setValue("customer_id", customerId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimate Information</CardTitle>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer_id">Customer</Label>
            <Select 
              onValueChange={handleCustomerChange}
              defaultValue={form.watch("customer_id")}
            >
              <SelectTrigger id="customer_id">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label htmlFor="vehicle_id">Vehicle</Label>
            <Select 
              onValueChange={(value) => form.setValue("vehicle_id", value)}
              defaultValue={form.watch("vehicle_id")}
              disabled={!selectedCustomer || vehiclesLoading}
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
          
          {/* Services Selection */}
          <div className="space-y-4">
            <Label>Services</Label>
            {servicesLoading ? (
              <div>Loading services...</div>
            ) : (
              <div className="space-y-4">
                {services?.map((service) => (
                  <div key={service.id} className="flex items-start space-x-3 p-3 border rounded-md">
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      className="mt-1"
                      onChange={(e) => {
                        const currentServices = form.watch("services") || [];
                        if (e.target.checked) {
                          form.setValue("services", [
                            ...currentServices,
                            {
                              id: service.id,
                              name: service.name,
                              description: service.description,
                              price: service.price,
                              quantity: 1
                            }
                          ]);
                        } else {
                          form.setValue("services", 
                            currentServices.filter(s => s.id !== service.id)
                          );
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <label htmlFor={`service-${service.id}`} className="font-medium">
                          {service.name}
                        </label>
                        <div className="text-muted-foreground">
                          ${service.price}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
