
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

interface CustomerSearchProps {
  form: UseFormReturn<WorkOrderFormValues>
}

export function CustomerSearch({ form }: CustomerSearchProps) {
  const [open, setOpen] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [createNewCustomer, setCreateNewCustomer] = useState<boolean>(true)

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, first_name, last_name, email, phone_number, street_address, unit_number, city, state_province, postal_code, country")
        .order("last_name", { ascending: true })
      
      if (error) throw error
      return data || []
    }
  })

  // Fetch vehicles for the selected customer
  const { data: vehicles } = useQuery({
    queryKey: ["customer_vehicles", selectedCustomer],
    queryFn: async () => {
      if (!selectedCustomer) return []
      
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("customer_id", selectedCustomer)
        .order("is_primary", { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!selectedCustomer,
  })

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId)
    
    // Find the selected customer to set customer info
    const selectedCustomer = clients?.find(client => client.id === customerId)
    if (selectedCustomer) {
      form.setValue("first_name", selectedCustomer.first_name)
      form.setValue("last_name", selectedCustomer.last_name)
      form.setValue("email", selectedCustomer.email)
      form.setValue("phone_number", selectedCustomer.phone_number)
      form.setValue("street_address", selectedCustomer.street_address || "")
      form.setValue("unit_number", selectedCustomer.unit_number || "")
      form.setValue("city", selectedCustomer.city || "")
      form.setValue("state_province", selectedCustomer.state_province || "")
      form.setValue("postal_code", selectedCustomer.postal_code || "")
      form.setValue("country", selectedCustomer.country || "")
      setCreateNewCustomer(false)
      
      // Set vehicle info if primary vehicle exists
      if (vehicles && vehicles.length > 0) {
        // Find primary vehicle or use the first one
        const primaryVehicle = vehicles.find(v => v.is_primary) || vehicles[0]
        
        if (primaryVehicle) {
          form.setValue("vehicle_make", primaryVehicle.make)
          form.setValue("vehicle_model", primaryVehicle.model)
          form.setValue("vehicle_year", primaryVehicle.year)
          form.setValue("vehicle_serial", primaryVehicle.vin || "")
          form.setValue("vehicle_trim", primaryVehicle.trim || "")
          form.setValue("vehicle_body_class", primaryVehicle.body_class || "")
          form.setValue("vehicle_doors", primaryVehicle.doors || null)
        }
      }
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-medium">Select Existing Customer</h3>
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCustomer ? 
              clients?.find(client => client.id === selectedCustomer)
                ? `${clients.find(client => client.id === selectedCustomer)?.first_name} ${clients.find(client => client.id === selectedCustomer)?.last_name}`
                : "Select a customer" 
              : "Select a customer"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          {open && (
            <div className="relative">
              <div className="flex items-center border-b px-3">
                <input
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  placeholder="Search customers..."
                />
              </div>
              
              {clientsLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading customers...
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto py-1">
                  {!clients || clients.length === 0 ? (
                    <div className="py-6 text-center text-sm">No customers found.</div>
                  ) : (
                    <div>
                      {clients
                        .filter(client => 
                          !customerSearchQuery || 
                          `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                          client.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
                        )
                        .map((client) => (
                          <div
                            key={client.id}
                            className={cn(
                              "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                              selectedCustomer === client.id ? "bg-accent text-accent-foreground" : ""
                            )}
                            onClick={() => {
                              handleCustomerChange(client.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCustomer === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span>{client.first_name || ''} {client.last_name || ''}</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {client.email || ''}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
      <div className="flex items-center space-x-2 mt-2">
        <Switch
          id="createNewCustomer" 
          checked={createNewCustomer}
          onCheckedChange={setCreateNewCustomer}
        />
        <label
          htmlFor="createNewCustomer"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Create new customer
        </label>
      </div>
    </div>
  )
}
