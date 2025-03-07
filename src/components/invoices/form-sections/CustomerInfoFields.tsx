
import { Input } from "@/components/ui/input"
import { CustomerInfoFieldsProps } from "./CustomerInfoFieldsProps"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"

export function CustomerInfoFields({
  customerFirstName,
  setCustomerFirstName,
  customerLastName,
  setCustomerLastName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  customers,
  isLoadingCustomers,
  onCustomerSelect,
  customerStreetAddress,
  setCustomerStreetAddress,
  customerUnitNumber,
  setCustomerUnitNumber,
  customerCity,
  setCustomerCity,
  customerStateProvince,
  setCustomerStateProvince,
  customerPostalCode,
  setCustomerPostalCode,
  customerCountry,
  setCustomerCountry,
  clientIdField,
  setClientId
}: CustomerInfoFieldsProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Fetch customers if not provided through props
  const { data: fetchedCustomers, isLoading: isFetchingCustomers } = useQuery({
    queryKey: ["customers", searchQuery],
    queryFn: async () => {
      if (customers) return customers
      
      const query = supabase
        .from("customers")
        .select("*")
        .order("last_name", { ascending: true })
      
      if (searchQuery) {
        query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    },
    enabled: !customers && open
  })
  
  const displayedCustomers = customers || fetchedCustomers || []
  const isLoading = isLoadingCustomers || isFetchingCustomers
  
  const handleCustomerSelect = (customer: any) => {
    setCustomerFirstName(customer.first_name || customer.customer_first_name || "")
    setCustomerLastName(customer.last_name || customer.customer_last_name || "")
    setCustomerEmail(customer.email || customer.customer_email || "")
    
    if (setCustomerPhone && (customer.phone_number || customer.customer_phone)) {
      setCustomerPhone(customer.phone_number || customer.customer_phone || "")
    }
    
    if (setCustomerAddress && customer.address) {
      setCustomerAddress(customer.address)
    }
    
    // Set detailed address fields if available
    if (setCustomerStreetAddress && customer.street_address) {
      setCustomerStreetAddress(customer.street_address)
    }
    
    if (setCustomerUnitNumber && customer.unit_number) {
      setCustomerUnitNumber(customer.unit_number)
    }
    
    if (setCustomerCity && customer.city) {
      setCustomerCity(customer.city)
    }
    
    if (setCustomerStateProvince && customer.state_province) {
      setCustomerStateProvince(customer.state_province)
    }
    
    if (setCustomerPostalCode && customer.postal_code) {
      setCustomerPostalCode(customer.postal_code)
    }
    
    if (setCustomerCountry && customer.country) {
      setCustomerCountry(customer.country)
    }
    
    if (setClientId && customer.id) {
      setClientId(customer.id)
    }
    
    if (onCustomerSelect) {
      onCustomerSelect(customer.id)
    }
    
    setOpen(false)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">Customer Information</h3>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Search className="h-3.5 w-3.5" />
              <span>Find Customer</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="end" side="bottom">
            <Command>
              <CommandInput 
                placeholder="Search customers..." 
                onValueChange={setSearchQuery} 
              />
              <CommandList>
                {isLoading ? (
                  <CommandEmpty>Loading customers...</CommandEmpty>
                ) : (
                  <>
                    <CommandEmpty>No customers found.</CommandEmpty>
                    <CommandGroup heading="Customers">
                      {displayedCustomers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          onSelect={() => handleCustomerSelect(customer)}
                          className="flex flex-col items-start"
                        >
                          <div className="font-medium">
                            {customer.first_name || customer.customer_first_name} {customer.last_name || customer.customer_last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.email || customer.customer_email}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input 
                value={customerFirstName} 
                onChange={(e) => setCustomerFirstName(e.target.value)}
                placeholder="John"
              />
            </FormControl>
          </FormItem>
        </div>
        
        <div>
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input 
                value={customerLastName} 
                onChange={(e) => setCustomerLastName(e.target.value)}
                placeholder="Doe"
              />
            </FormControl>
          </FormItem>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input 
                value={customerEmail} 
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="john.doe@example.com"
                type="email"
              />
            </FormControl>
          </FormItem>
        </div>
        
        {setCustomerPhone && (
          <div>
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(123) 456-7890"
                />
              </FormControl>
            </FormItem>
          </div>
        )}
      </div>
      
      {(setCustomerAddress && customerAddress !== undefined) && (
        <div>
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input 
                value={customerAddress} 
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="123 Main St, City, State 12345"
              />
            </FormControl>
          </FormItem>
        </div>
      )}
      
      {/* Detailed address fields */}
      {setCustomerStreetAddress && customerStreetAddress !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-4">
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input 
                  value={customerStreetAddress} 
                  onChange={(e) => setCustomerStreetAddress(e.target.value)}
                  placeholder="123 Main St"
                />
              </FormControl>
            </FormItem>
          </div>
          
          <div className="md:col-span-2">
            <FormItem>
              <FormLabel>Unit/Apt</FormLabel>
              <FormControl>
                <Input 
                  value={customerUnitNumber} 
                  onChange={(e) => setCustomerUnitNumber(e.target.value)}
                  placeholder="Apt 4B"
                />
              </FormControl>
            </FormItem>
          </div>
        </div>
      )}
      
      {setCustomerCity && customerCity !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input 
                  value={customerCity} 
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="City"
                />
              </FormControl>
            </FormItem>
          </div>
          
          <div className="md:col-span-2">
            <FormItem>
              <FormLabel>State/Province</FormLabel>
              <FormControl>
                <Input 
                  value={customerStateProvince} 
                  onChange={(e) => setCustomerStateProvince(e.target.value)}
                  placeholder="State"
                />
              </FormControl>
            </FormItem>
          </div>
          
          <div className="md:col-span-2">
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input 
                  value={customerPostalCode} 
                  onChange={(e) => setCustomerPostalCode(e.target.value)}
                  placeholder="12345"
                />
              </FormControl>
            </FormItem>
          </div>
        </div>
      )}
      
      {setCustomerCountry && customerCountry !== undefined && (
        <div>
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Input 
                value={customerCountry} 
                onChange={(e) => setCustomerCountry(e.target.value)}
                placeholder="Country"
              />
            </FormControl>
          </FormItem>
        </div>
      )}
    </div>
  )
}
