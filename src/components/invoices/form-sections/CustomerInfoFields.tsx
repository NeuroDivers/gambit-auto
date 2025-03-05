
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  customers = [],
  isLoadingCustomers = false,
  onCustomerSelect
}: CustomerInfoFieldsProps) {
  return (
    <div className="space-y-4">
      {customers.length > 0 && onCustomerSelect && (
        <div>
          <Label>Select Existing Customer</Label>
          <Select onValueChange={onCustomerSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a customer..." />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name} - {customer.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-4">
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

        <div>
          <Label htmlFor="customerAddress">Address</Label>
          <Input
            id="customerAddress"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Enter address..."
          />
        </div>
      </div>
    </div>
  )
}
