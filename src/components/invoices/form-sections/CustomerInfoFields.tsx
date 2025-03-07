
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Search, Star } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

type CustomerInfoFieldsProps = {
  customerFirstName: string
  setCustomerFirstName: (value: string) => void
  customerLastName: string
  setCustomerLastName: (value: string) => void
  customerEmail: string
  setCustomerEmail: (value: string) => void
  customerPhone: string
  setCustomerPhone: (value: string) => void
  customerAddress: string
  setCustomerAddress: (value: string) => void
  customerStreetAddress?: string
  setCustomerStreetAddress?: (value: string) => void
  customerUnitNumber?: string
  setCustomerUnitNumber?: (value: string) => void
  customerCity?: string
  setCustomerCity?: (value: string) => void
  customerStateProvince?: string
  setCustomerStateProvince?: (value: string) => void
  customerPostalCode?: string
  setCustomerPostalCode?: (value: string) => void
  customerCountry?: string
  setCustomerCountry?: (value: string) => void
  customers?: any[]
  isLoadingCustomers?: boolean
  onCustomerSelect?: (customerId: string) => void
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
  customers = [],
  isLoadingCustomers = false,
  onCustomerSelect
}: CustomerInfoFieldsProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  const { data: customersList, isLoading } = useQuery({
    queryKey: ["customers_for_invoice"],
    queryFn: async () => {
      console.log("Fetching customers for invoice creation")
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("customer_last_name", { ascending: true })
      
      if (error) {
        console.error("Error fetching customers:", error)
        throw error
      }
      console.log("Fetched customers:", data)
      return data || []
    }
  })

  const handleCustomerSelect = async (customerId: string) => {
    setSelectedCustomerId(customerId)
    
    const selectedCustomer = customersList?.find(c => c.id === customerId)
    if (selectedCustomer) {
      console.log("Selected customer:", selectedCustomer)
      setCustomerFirstName(selectedCustomer.customer_first_name || "")
      setCustomerLastName(selectedCustomer.customer_last_name || "")
      setCustomerEmail(selectedCustomer.customer_email || "")
      setCustomerPhone(selectedCustomer.customer_phone || "")
      
      // Set full address for backward compatibility
      const fullAddress = [
        selectedCustomer.customer_street_address,
        selectedCustomer.customer_unit_number ? `Unit ${selectedCustomer.customer_unit_number}` : "",
        selectedCustomer.customer_city,
        selectedCustomer.customer_state_province,
        selectedCustomer.customer_postal_code,
        selectedCustomer.customer_country
      ].filter(Boolean).join(", ")
      setCustomerAddress(fullAddress)
      
      // Set individual address fields if they exist
      if (setCustomerStreetAddress) setCustomerStreetAddress(selectedCustomer.customer_street_address || "")
      if (setCustomerUnitNumber) setCustomerUnitNumber(selectedCustomer.customer_unit_number || "")
      if (setCustomerCity) setCustomerCity(selectedCustomer.customer_city || "")
      if (setCustomerStateProvince) setCustomerStateProvince(selectedCustomer.customer_state_province || "")
      if (setCustomerPostalCode) setCustomerPostalCode(selectedCustomer.customer_postal_code || "")
      if (setCustomerCountry) setCustomerCountry(selectedCustomer.customer_country || "")
      
      // Fetch customer vehicles
      try {
        const { data: vehicles, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('customer_id', customerId)
          .order('is_primary', { ascending: false })

        if (error) {
          console.error('Error fetching customer vehicles:', error)
        } else if (vehicles && vehicles.length > 0) {
          // Find primary vehicle or fallback to first vehicle
          const primaryVehicle = vehicles.find(v => v.is_primary) || vehicles[0];
          console.log("Selected vehicle for customer:", primaryVehicle)
          
          // Dispatch event to inform parent components
          if (onCustomerSelect) onCustomerSelect(customerId)
        }
      } catch (error) {
        console.error('Error in vehicle fetch process:', error)
      }
    }
    
    setOpen(false)
  }

  const filteredCustomers = customersList?.filter(customer => 
    !searchQuery || 
    `${customer.customer_first_name} ${customer.customer_last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.customer_phone?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-4">
      <div>
        <Label>Find Customer</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedCustomerId ? 
                filteredCustomers.find(c => c.id === selectedCustomerId)
                  ? `${filteredCustomers.find(c => c.id === selectedCustomerId)?.customer_first_name} ${filteredCustomers.find(c => c.id === selectedCustomerId)?.customer_last_name}`
                  : "Select a customer" 
                : "Select a customer"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers..."
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Loading customers...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="py-6 text-center text-sm">No customers found.</div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={cn(
                      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                      selectedCustomerId === customer.id ? "bg-accent text-accent-foreground" : ""
                    )}
                    onClick={() => handleCustomerSelect(customer.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.customer_first_name} {customer.customer_last_name}</span>
                      <span className="text-xs text-muted-foreground">{customer.customer_email}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerFirstName">First Name</Label>
          <Input
            id="customerFirstName"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            placeholder="Enter first name..."
          />
        </div>

        <div>
          <Label htmlFor="customerLastName">Last Name</Label>
          <Input
            id="customerLastName"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Enter last name..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerEmail">Email</Label>
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Enter email..."
          />
        </div>

        <div>
          <Label htmlFor="customerPhone">Phone</Label>
          <Input
            id="customerPhone"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Enter phone number..."
          />
        </div>
      </div>

      {customerStreetAddress !== undefined && setCustomerStreetAddress && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="customerStreetAddress">Street Address</Label>
                  <Input
                    id="customerStreetAddress"
                    value={customerStreetAddress}
                    onChange={(e) => setCustomerStreetAddress(e.target.value)}
                    placeholder="Enter street address..."
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="customerUnitNumber">Unit Number</Label>
                  <Input
                    id="customerUnitNumber"
                    value={customerUnitNumber}
                    onChange={(e) => setCustomerUnitNumber && setCustomerUnitNumber(e.target.value)}
                    placeholder="Enter unit number..."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="customerCity">City</Label>
                  <Input
                    id="customerCity"
                    value={customerCity}
                    onChange={(e) => setCustomerCity && setCustomerCity(e.target.value)}
                    placeholder="Enter city..."
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="customerStateProvince">State/Province</Label>
                  <Input
                    id="customerStateProvince"
                    value={customerStateProvince}
                    onChange={(e) => setCustomerStateProvince && setCustomerStateProvince(e.target.value)}
                    placeholder="Enter state/province..."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="customerPostalCode">Postal Code</Label>
                  <Input
                    id="customerPostalCode"
                    value={customerPostalCode}
                    onChange={(e) => setCustomerPostalCode && setCustomerPostalCode(e.target.value)}
                    placeholder="Enter postal code..."
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="customerCountry">Country</Label>
                  <Input
                    id="customerCountry"
                    value={customerCountry}
                    onChange={(e) => setCustomerCountry && setCustomerCountry(e.target.value)}
                    placeholder="Enter country..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {setCustomerStreetAddress === undefined && (
        <div>
          <Label htmlFor="customerAddress">Address</Label>
          <Input
            id="customerAddress"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Enter address..."
          />
        </div>
      )}
    </div>
  )
}
