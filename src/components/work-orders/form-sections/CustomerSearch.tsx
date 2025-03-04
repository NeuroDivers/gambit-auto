
import { useState, useCallback, useEffect } from "react"
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

type CustomerWithVehicles = Customer & { 
  vehicles: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
    body_class?: string;
    doors?: number;
    trim?: string;
    is_primary?: boolean;
  }>
};

export function CustomerSearch({ form }: CustomerSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [customerList, setCustomerList] = useState<CustomerWithVehicles[]>([])
  
  // Query for customers and their primary vehicle
  const { data, isLoading, error, refetch } = useQuery({
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
        const { data: customersData, error } = await query
        
        if (error) {
          console.error('Error fetching customers:', error)
          return { customers: [], error }
        }
        
        console.log('Fetched customers data:', customersData);
        return { customers: customersData || [], error: null }
      } catch (error) {
        console.error('Error in customer search query:', error)
        return { customers: [], error }
      }
    },
    enabled: false, // Don't run on mount - we'll use refetch when the popover opens
  })

  // Update customers state whenever data changes
  useEffect(() => {
    if (data && data.customers && Array.isArray(data.customers)) {
      console.log('Setting customer list with data:', data.customers.length, 'customers');
      setCustomerList(data.customers as CustomerWithVehicles[]);
    } else {
      console.log('Data or data.customers is not valid, setting empty array', data);
      setCustomerList([]);
    }
  }, [data]);

  // Refetch when popover opens or search query changes
  useEffect(() => {
    if (open) {
      console.log('Popover opened or search query changed, refetching');
      refetch();
    }
  }, [open, searchQuery, refetch]);
 
  const applyCustomerData = useCallback((customer: CustomerWithVehicles) => {
    if (!customer) {
      console.log('Customer is null, not applying data');
      return;
    }
    
    try {
      console.log('Applying customer data:', customer);
      
      // Set customer information
      form.setValue('first_name', customer.first_name || '');
      form.setValue('last_name', customer.last_name || '');
      form.setValue('email', customer.email || '');
      form.setValue('phone_number', customer.phone_number || '');
      form.setValue('address', customer.address || '');
      
      // Find primary vehicle or first vehicle
      const primaryVehicle = customer.vehicles && Array.isArray(customer.vehicles) 
        ? (customer.vehicles.find(v => v.is_primary) || customer.vehicles[0])
        : null;
      
      // If a vehicle exists, set vehicle information
      if (primaryVehicle) {
        console.log('Found vehicle:', primaryVehicle);
        form.setValue('vehicle_make', primaryVehicle.make || '');
        form.setValue('vehicle_model', primaryVehicle.model || '');
        form.setValue('vehicle_year', primaryVehicle.year || new Date().getFullYear());
        form.setValue('vehicle_serial', primaryVehicle.vin || '');
        form.setValue('vehicle_body_class', primaryVehicle.body_class || '');
        form.setValue('vehicle_doors', primaryVehicle.doors || null);
        form.setValue('vehicle_trim', primaryVehicle.trim || '');
      } else {
        console.log('No vehicle found for customer');
      }
      
      setOpen(false);
      toast.success(`Customer ${customer.first_name} ${customer.last_name} selected`);
    } catch (err) {
      console.error("Error applying customer data:", err);
      toast.error("Failed to select customer");
    }
  }, [form]);

  const displayValue = form.getValues("first_name") && form.getValues("last_name") 
    ? `${form.getValues("first_name")} ${form.getValues("last_name")}`
    : "Search for customer...";

  if (error) {
    console.error('Customer search error:', error);
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
            {displayValue}
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
                {customerList.length === 0 ? (
                  <CommandEmpty>No customers found.</CommandEmpty>
                ) : (
                  customerList.map((customer) => (
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
                  ))
                )}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

