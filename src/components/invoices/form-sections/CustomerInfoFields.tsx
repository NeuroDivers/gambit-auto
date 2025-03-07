
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

export interface CustomerInfoFieldsProps {
  customerFirstName: string;
  setCustomerFirstName: (value: string) => void;
  customerLastName: string;
  setCustomerLastName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  customerAddress: string;
  setCustomerAddress: (value: string) => void;
  customers?: any[];
  isLoadingCustomers?: boolean;
  onCustomerSelect?: (customerId: string) => void;
}

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
  customers = [],
  isLoadingCustomers = false,
  onCustomerSelect
}: CustomerInfoFieldsProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const selectCustomer = (customerId: string) => {
    setValue(customerId)
    setOpen(false)
    
    const selectedCustomer = customers.find(customer => customer.id === customerId)
    if (selectedCustomer) {
      setCustomerFirstName(selectedCustomer.customer_first_name || selectedCustomer.first_name || "")
      setCustomerLastName(selectedCustomer.customer_last_name || selectedCustomer.last_name || "")
      setCustomerEmail(selectedCustomer.customer_email || selectedCustomer.email || "")
      setCustomerPhone(selectedCustomer.customer_phone || selectedCustomer.phone_number || "")
      
      const address = [
        selectedCustomer.customer_street_address || selectedCustomer.street_address,
        selectedCustomer.customer_city || selectedCustomer.city,
        selectedCustomer.customer_state_province || selectedCustomer.state_province,
        selectedCustomer.customer_postal_code || selectedCustomer.postal_code
      ].filter(Boolean).join(", ")
      
      setCustomerAddress(address)
    }
    
    if (onCustomerSelect) {
      onCustomerSelect(customerId)
    }
  }

  return (
    <div className="space-y-4">
      {customers && customers.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Search Existing Customers</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between overflow-hidden"
              >
                {value
                  ? customers.find((customer) => customer.id === value)?.customer_first_name + " " + 
                    customers.find((customer) => customer.id === value)?.customer_last_name
                  : "Select a customer..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search customers..." />
                <CommandEmpty>
                  {isLoadingCustomers ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    "No customers found."
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {customers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.id}
                      onSelect={() => selectCustomer(customer.id)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          value === customer.id ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {customer.customer_first_name || customer.first_name} {customer.customer_last_name || customer.last_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">First Name</label>
          <Input 
            value={customerFirstName} 
            onChange={(e) => setCustomerFirstName(e.target.value)}
            placeholder="First name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Last Name</label>
          <Input 
            value={customerLastName} 
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input 
            type="email"
            value={customerEmail} 
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Email address"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <Input 
            value={customerPhone} 
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Address</label>
        <Input 
          value={customerAddress} 
          onChange={(e) => setCustomerAddress(e.target.value)}
          placeholder="Full address"
        />
      </div>
    </div>
  )
}

// Default export for compatibility
export default CustomerInfoFields;
