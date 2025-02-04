import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
}: CustomerInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerFirstName">First Name</Label>
          <Input
            id="customerFirstName"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            placeholder="Enter first name..."
            required
          />
        </div>
        <div>
          <Label htmlFor="customerLastName">Last Name</Label>
          <Input
            id="customerLastName"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Enter last name..."
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="customerEmail">Customer Email</Label>
        <Input
          id="customerEmail"
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="Enter customer email..."
          required
        />
      </div>
      <div>
        <Label htmlFor="customerPhone">Customer Phone</Label>
        <Input
          id="customerPhone"
          type="tel"
          value={customerPhone || ''}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Enter customer phone..."
        />
      </div>
      <div>
        <Label htmlFor="customerAddress">Customer Address</Label>
        <Textarea
          id="customerAddress"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          placeholder="Enter customer address..."
          className="min-h-[80px]"
        />
      </div>
    </div>
  )
}