
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ClientInfoFieldsProps = {
  clientFirstName: string
  setClientFirstName: (value: string) => void
  clientLastName: string
  setClientLastName: (value: string) => void
  clientEmail: string
  setClientEmail: (value: string) => void
  clientPhone: string
  setClientPhone: (value: string) => void
  clientAddress: string
  setClientAddress: (value: string) => void
  clients?: any[]
  isLoadingClients?: boolean
  onClientSelect?: (clientId: string) => void
}

export function ClientInfoFields({
  clientFirstName,
  setClientFirstName,
  clientLastName,
  setClientLastName,
  clientEmail,
  setClientEmail,
  clientPhone,
  setClientPhone,
  clientAddress,
  setClientAddress,
  clients = [],
  isLoadingClients = false,
  onClientSelect
}: ClientInfoFieldsProps) {
  return (
    <div className="space-y-4">
      {clients.length > 0 && onClientSelect && (
        <div>
          <Label>Select Existing Client</Label>
          <Select onValueChange={onClientSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a client..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.first_name} {client.last_name} - {client.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="clientFirstName">First Name</Label>
          <Input
            id="clientFirstName"
            value={clientFirstName}
            onChange={(e) => setClientFirstName(e.target.value)}
            placeholder="Enter first name..."
          />
        </div>

        <div>
          <Label htmlFor="clientLastName">Last Name</Label>
          <Input
            id="clientLastName"
            value={clientLastName}
            onChange={(e) => setClientLastName(e.target.value)}
            placeholder="Enter last name..."
          />
        </div>

        <div>
          <Label htmlFor="clientEmail">Email</Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="Enter email..."
          />
        </div>

        <div>
          <Label htmlFor="clientPhone">Phone</Label>
          <Input
            id="clientPhone"
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="Enter phone number..."
          />
        </div>

        <div>
          <Label htmlFor="clientAddress">Address</Label>
          <Input
            id="clientAddress"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            placeholder="Enter address..."
          />
        </div>
      </div>
    </div>
  )
}
