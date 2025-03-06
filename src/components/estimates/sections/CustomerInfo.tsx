
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
        <p className="text-lg font-medium">{customer.customer_first_name} {customer.customer_last_name}</p>
        {customer.customer_email && (
          <p className="text-sm text-muted-foreground">
            Email: {customer.customer_email}
          </p>
        )}
        {customer.customer_phone && (
          <p className="text-sm text-muted-foreground">
            Phone: {customer.customer_phone}
          </p>
        )}
        {(customer.customer_street_address || customer.customer_city || customer.customer_state_province) && (
          <div className="text-sm text-muted-foreground">
            <p>Address:</p>
            {customer.customer_street_address && <p>{customer.customer_street_address}</p>}
            <p>
              {[customer.customer_city, customer.customer_state_province, customer.customer_postal_code]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
