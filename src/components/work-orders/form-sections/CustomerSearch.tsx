
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Customer } from "@/components/customers/types"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CustomerSearchProps {
  form: UseFormReturn<WorkOrderFormValues>
}

export function CustomerSearch({ form }: CustomerSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Query for customers and their primary vehicle
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async () => {
      try {
        let query = supabase
          .from('customers')
          .select(`
            *,
            vehicles(*)
          `)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (searchQuery) {
          query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        }
        
        const { data: customersData, error } = await query
        
        if (error) {
          console.error('Error fetching customers:', error)
          throw error
        }
        
        return (customersData || []) as (Customer & { vehicles: any[] })[]
      } catch (error) {
        console.error('Error in customer search query:', error)
        return []
      }
    },
    enabled: true,
  })

  const applyCustomerData = (customer: Customer & { vehicles: any[] }) => {
    // Set customer information
    form.setValue('first_name', customer.first_name)
    form.setValue('last_name', customer.last_name)
    form.setValue('email', customer.email)
    form.setValue('phone_number', customer.phone_number || '')
    form.setValue('address', customer.address || '')
    
    // Find primary vehicle or first vehicle
    const primaryVehicle = customer.vehicles?.find(v => v.is_primary) || customer.vehicles?.[0]
    
    // If a vehicle exists, set vehicle information
    if (primaryVehicle) {
      form.setValue('vehicle_make', primaryVehicle.make)
      form.setValue('vehicle_model', primaryVehicle.model)
      form.setValue('vehicle_year', primaryVehicle.year)
      form.setValue('vehicle_serial', primaryVehicle.vin || '')
      form.setValue('vehicle_body_class', primaryVehicle.body_class || '')
      form.setValue('vehicle_doors', primaryVehicle.doors || null)
      form.setValue('vehicle_trim', primaryVehicle.trim || '')
    }
    
    setOpen(false)
    toast.success(`Customer ${customer.first_name} ${customer.last_name} selected`)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <User className="h-4 w-4 text-muted-foreground" />
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
            {searchQuery || "Search for customer..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full" align="start">
          <Command>
            <CommandInput 
              placeholder="Search customers..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading customers...
              </div>
            ) : (
              <CommandGroup>
                {customers && customers.length > 0 ? (
                  customers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={`${customer.first_name} ${customer.last_name}`}
                      onSelect={() => applyCustomerData(customer)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          form.getValues("first_name") === customer.first_name &&
                          form.getValues("last_name") === customer.last_name
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {customer.first_name} {customer.last_name}
                      <span className="ml-2 text-muted-foreground">{customer.email}</span>
                    </CommandItem>
                  ))
                ) : (
                  <CommandEmpty>No customers found.</CommandEmpty>
                )}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
