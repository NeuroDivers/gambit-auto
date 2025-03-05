
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CustomerInfo({ customer }) {
  if (!customer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No customer information available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-lg font-medium">{customer.first_name} {customer.last_name}</p>
        {customer.email && (
          <p className="text-sm text-muted-foreground">
            Email: {customer.email}
          </p>
        )}
        {customer.phone_number && (
          <p className="text-sm text-muted-foreground">
            Phone: {customer.phone_number}
          </p>
        )}
        {(customer.street_address || customer.city || customer.state_province) && (
          <div className="text-sm text-muted-foreground">
            <p>Address:</p>
            {customer.street_address && <p>{customer.street_address}</p>}
            <p>
              {[customer.city, customer.state_province, customer.postal_code]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
