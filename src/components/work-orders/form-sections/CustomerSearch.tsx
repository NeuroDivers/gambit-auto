
import { useState, useCallback, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Customer } from "@/components/customers/types"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Loader2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CustomerSearchProps {
  form: UseFormReturn<WorkOrderFormValues>
}

type CustomerVehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string | null;
  body_class?: string | null;
  doors?: number | null;
  trim?: string | null;
  is_primary?: boolean | null;
};

type CustomerWithVehicles = Customer & { 
  vehicles: CustomerVehicle[]
};

export function CustomerSearch({ form }: CustomerSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [customers, setCustomers] = useState<CustomerWithVehicles[]>([])
  
  // Fetch customers with their vehicles - but don't run on mount
  const { isLoading, error, refetch } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async () => {
      try {
        console.log('Fetching customers with query:', searchQuery);
        let query = supabase
          .from('customers')
          .select(`
            *,
            vehicles(*)
          `)
          .order('created_at', { ascending: false })
        
        if (searchQuery && searchQuery.trim() !== '') {
          query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        }
        
        query = query.limit(10)
        const { data, error } = await query
        
        if (error) {
          console.error('Error fetching customers:', error)
          throw error
        }
        
        console.log('Fetched customers data:', data?.length || 0, 'customers');
        return { customers: data || [] }
      } catch (error) {
        console.error('Error in customer search query:', error)
        throw error
      }
    },
    enabled: false, // Don't run on mount
  })

  // Fetch customers when popover opens or search changes
  useEffect(() => {
    if (open) {
      console.log('Popover opened or search changed, fetching customers');
      const fetchCustomers = async () => {
        try {
          const result = await refetch();
          
          if (result.isSuccess && result.data?.customers) {
            // Ensure customers is always an array
            const customersData = Array.isArray(result.data.customers) ? result.data.customers : [];
            console.log('Setting customers state with:', customersData.length, 'customers');
            setCustomers(customersData);
          } else {
            console.log('Query succeeded but no valid data, setting empty array');
            setCustomers([]);
          }
        } catch (err) {
          console.error('Error during customer fetch:', err);
          setCustomers([]);
        }
      };
      
      fetchCustomers();
    }
  }, [open, searchQuery, refetch]);
 
  // Apply selected customer data to the form
  const applyCustomerData = useCallback((customer: CustomerWithVehicles) => {
    if (!customer) {
      console.log('Customer is null, not applying data');
      return;
    }
    
    try {
      console.log('Applying customer data:', customer.first_name, customer.last_name);
      
      // Set customer information
      form.setValue('first_name', customer.first_name || '');
      form.setValue('last_name', customer.last_name || '');
      form.setValue('email', customer.email || '');
      form.setValue('phone_number', customer.phone_number || '');
      form.setValue('address', customer.address || '');
      
      // Check if vehicles array exists and is not empty
      const hasVehicles = customer.vehicles && 
                         Array.isArray(customer.vehicles) && 
                         customer.vehicles.length > 0;
      
      // Find primary vehicle or first vehicle if available
      if (hasVehicles) {
        // Safely access vehicles array
        const vehicles = customer.vehicles || [];
        const primaryVehicle = vehicles.find(v => v.is_primary) || vehicles[0];
        
        console.log('Found vehicle:', primaryVehicle);
        form.setValue('vehicle_make', primaryVehicle.make || '');
        form.setValue('vehicle_model', primaryVehicle.model || '');
        form.setValue('vehicle_year', primaryVehicle.year || new Date().getFullYear());
        form.setValue('vehicle_serial', primaryVehicle.vin || '');
        
        // Optional fields that might be null
        if (primaryVehicle.body_class) {
          form.setValue('vehicle_body_class', primaryVehicle.body_class);
        }
        
        if (primaryVehicle.doors !== null && primaryVehicle.doors !== undefined) {
          form.setValue('vehicle_doors', primaryVehicle.doors);
        }
        
        if (primaryVehicle.trim) {
          form.setValue('vehicle_trim', primaryVehicle.trim);
        }
      } else {
        console.log('No vehicles found for customer');
      }
      
      setOpen(false);
      toast.success(`Customer ${customer.first_name} ${customer.last_name} selected`);
    } catch (err) {
      console.error("Error applying customer data:", err);
      toast.error("Failed to select customer");
    }
  }, [form]);

  // Get display value for the customer selection button
  const displayValue = form.getValues("first_name") && form.getValues("last_name") 
    ? `${form.getValues("first_name")} ${form.getValues("last_name")}`
    : "Search for customer...";

  // Always ensure customers is a valid array
  const safeCustomers = Array.isArray(customers) ? customers : [];

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
            {displayValue}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        {open && (
          <PopoverContent className="p-0 w-full" align="start">
            <Command className="w-full">
              <CommandInput 
                placeholder="Search customers..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading customers...
                </div>
              )}
              
              {!isLoading && safeCustomers.length === 0 && (
                <CommandEmpty>No customers found.</CommandEmpty>
              )}
              
              {!isLoading && safeCustomers.length > 0 && (
                <CommandGroup>
                  {safeCustomers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={`${customer.first_name || ''} ${customer.last_name || ''}`}
                      onSelect={() => applyCustomerData(customer)}
                      className="flex items-center"
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
                      <span>{customer.first_name || ''} {customer.last_name || ''}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{customer.email || ''}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
