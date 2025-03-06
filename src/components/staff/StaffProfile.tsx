
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MapPinIcon, PhoneIcon, UserIcon } from "lucide-react"

type StaffProfileProps = {
  staff: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    position?: string;
    department?: string;
    employee_id?: string;
    employment_date?: string;
    is_full_time?: boolean;
    status?: string;
    role_name?: string;
    avatar_url?: string;
    street_address?: string;
    unit_number?: string;
    city?: string;
    state_province?: string;
    postal_code?: string;
    country?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  };
}

export function StaffProfile({ staff }: StaffProfileProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src={staff.avatar_url || ""} alt={`${staff.first_name} ${staff.last_name}`} />
                <AvatarFallback className="text-lg">
                  {staff.first_name?.[0]}{staff.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-medium text-lg">{staff.first_name} {staff.last_name}</h3>
                <p className="text-sm text-muted-foreground">{staff.position}</p>
              </div>
              <Badge variant={staff.status === 'active' ? 'success' : 'secondary'} className="mt-1">
                {staff.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{staff.email || 'N/A'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3.5 w-3.5" />
                    <span>Phone</span>
                  </p>
                  <p>{staff.phone_number || 'N/A'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>Department</span>
                  </p>
                  <p>{staff.department || 'N/A'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>Employment Date</span>
                  </p>
                  <p>{staff.employment_date ? new Date(staff.employment_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                  <p>{staff.employee_id || 'N/A'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Employment Type</p>
                  <p>{staff.is_full_time ? 'Full-time' : 'Part-time'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p>{staff.role_name || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MapPinIcon className="h-3.5 w-3.5" />
                <span>Address</span>
              </p>
              <p className="text-sm">
                {[
                  staff.street_address,
                  staff.unit_number ? `Unit ${staff.unit_number}` : null,
                  staff.city,
                  staff.state_province,
                  staff.postal_code,
                  staff.country
                ].filter(Boolean).join(', ') || 'No address on file'}
              </p>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{staff.emergency_contact_name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3.5 w-3.5" />
                    <span>Phone</span>
                  </p>
                  <p>{staff.emergency_contact_phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
