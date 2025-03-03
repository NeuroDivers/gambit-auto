
import { Customer } from "../types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Calendar, Edit } from "lucide-react"

interface CustomerHeaderProps {
  customer: Customer
}

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                {customer.first_name?.[0]}{customer.last_name?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {customer.first_name} {customer.last_name}
                </h1>
                <p className="text-muted-foreground">
                  Customer since {new Date(customer.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Customer
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{customer.email}</span>
          </div>
          {customer.phone_number && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{customer.phone_number}</span>
            </div>
          )}
          {(customer.city || customer.state_province) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {[
                  customer.street_address,
                  customer.city,
                  customer.state_province,
                  customer.postal_code,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
          {customer.last_sign_in_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Last login: {new Date(customer.last_sign_in_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
