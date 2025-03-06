
import { useState, useEffect } from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

type CustomerType = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
}

interface CustomerSearchProps {
  form: UseFormReturn<any>
}

export function CustomerSearch({ form }: CustomerSearchProps) {
  const [customers, setCustomers] = useState<CustomerType[]>([])
  const [openCustomerSelect, setOpenCustomerSelect] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [useNewCustomer, setUseNewCustomer] = useState(true)
  
  // Fetch customer list
  useEffect(() => {
    async function fetchCustomers() {
      const { data, error } = await supabase
        .from("customers")
        .select("id, first_name, last_name, email, phone_number")
        .order("last_name", { ascending: true })
      
      if (error) {
        console.error("Error fetching customers:", error)
        return
      }
      
      setCustomers(data || [])
    }
    
    fetchCustomers()
  }, [])
  
  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    form.setValue("client_id", customerId)
    
    // Find the selected customer
    const selectedCustomer = customers.find(customer => customer.id === customerId)
    if (selectedCustomer) {
      // Auto-fill customer details
      form.setValue("first_name", selectedCustomer.first_name)
      form.setValue("last_name", selectedCustomer.last_name)
      form.setValue("email", selectedCustomer.email)
      form.setValue("phone_number", selectedCustomer.phone_number)
      form.setValue("contact_preference", "phone") // Default to phone since it's not in the DB
      setUseNewCustomer(false)
    }
    
    setOpenCustomerSelect(false)
  }
  
  return (
    <div className="space-y-4">
      <FormItem className="flex flex-col">
        <FormLabel>Customer</FormLabel>
        <Popover open={openCustomerSelect} onOpenChange={setOpenCustomerSelect}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCustomerSelect}
                className="justify-between w-full"
              >
                {form.watch("client_id") ? 
                  customers.find(c => c.id === form.watch("client_id")) 
                    ? `${customers.find(c => c.id === form.watch("client_id"))?.first_name} ${customers.find(c => c.id === form.watch("client_id"))?.last_name}` 
                    : "Select customer"
                  : "Select customer"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <div className="flex items-center border-b px-3">
              <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                placeholder="Search customers..."
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto py-1">
              {customers.length === 0 ? (
                <div className="py-6 text-center text-sm">No customers found</div>
              ) : (
                customers
                  .filter(customer => 
                    !customerSearchQuery || 
                    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                    customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
                  )
                  .map(customer => (
                    <div
                      key={customer.id}
                      className={cn(
                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                        form.watch("client_id") === customer.id ? "bg-accent text-accent-foreground" : ""
                      )}
                      onClick={() => handleCustomerSelect(customer.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          form.watch("client_id") === customer.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div>
                        <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="newCustomer"
          checked={useNewCustomer}
          onCheckedChange={(checked) => {
            setUseNewCustomer(checked)
            if (checked) {
              form.setValue("client_id", "")
            }
          }}
        />
        <label
          htmlFor="newCustomer"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Create new customer
        </label>
      </div>
      
      {useNewCustomer && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}
