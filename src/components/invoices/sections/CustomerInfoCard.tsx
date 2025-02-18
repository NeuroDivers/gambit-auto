
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CustomerInfoCardProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
}

export function CustomerInfoCard({
  firstName,
  lastName,
  email,
  phone,
  address
}: CustomerInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="font-medium">Name</p>
          <p>{firstName} {lastName}</p>
        </div>
        <div>
          <p className="font-medium">Email</p>
          <p>{email}</p>
        </div>
        <div>
          <p className="font-medium">Phone</p>
          <p>{phone}</p>
        </div>
        {address && (
          <div>
            <p className="font-medium">Address</p>
            <p>{address}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
