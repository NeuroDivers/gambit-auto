
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MailIcon, PhoneIcon, MapPinIcon, BriefcaseIcon, UserIcon } from "lucide-react";
import { format } from "date-fns";

interface StaffProfileProps {
  staffMember: {
    profile_id?: string;
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
    unit_number?: string;
    street_address?: string;
    city?: string;
    state_province?: string;
    postal_code?: string;
    country?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    role?: {
      name?: string;
    };
  };
}

export function StaffProfile({ staffMember }: StaffProfileProps) {
  const fullName = `${staffMember?.first_name || ''} ${staffMember?.last_name || ''}`.trim();
  const initials = `${staffMember?.first_name?.[0] || ''}${staffMember?.last_name?.[0] || ''}`.toUpperCase();

  const formatAddress = () => {
    const parts = [];
    if (staffMember?.street_address) {
      if (staffMember?.unit_number) {
        parts.push(`${staffMember.unit_number} - ${staffMember.street_address}`);
      } else {
        parts.push(staffMember.street_address);
      }
    }
    
    if (staffMember?.city && staffMember?.state_province) {
      parts.push(`${staffMember.city}, ${staffMember.state_province}`);
    } else if (staffMember?.city) {
      parts.push(staffMember.city);
    }
    
    if (staffMember?.postal_code) {
      parts.push(staffMember.postal_code);
    }
    
    if (staffMember?.country) {
      parts.push(staffMember.country);
    }
    
    return parts.join(", ");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h3 className="font-semibold text-lg">{fullName}</h3>
                <p className="text-sm text-muted-foreground">{staffMember?.role?.name || 'Staff Member'}</p>
              </div>
              
              {staffMember?.status && (
                <Badge variant={staffMember.status === 'active' ? 'outline' : 'secondary'}>
                  {staffMember.status.charAt(0).toUpperCase() + staffMember.status.slice(1)}
                </Badge>
              )}
            </div>
            
            <Separator orientation="vertical" className="hidden md:block" />
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffMember?.email && (
                <div className="flex items-center gap-2">
                  <MailIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{staffMember.email}</span>
                </div>
              )}
              
              {staffMember?.phone_number && (
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{staffMember.phone_number}</span>
                </div>
              )}
              
              {staffMember?.position && (
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{staffMember.position}</span>
                </div>
              )}
              
              {staffMember?.department && (
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{staffMember.department}</span>
                </div>
              )}
              
              {staffMember?.employment_date && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Employed since: {format(new Date(staffMember.employment_date), 'PPP')}</span>
                </div>
              )}
              
              {staffMember?.employee_id && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">ID:</span>
                  <span>{staffMember.employee_id}</span>
                </div>
              )}
              
              <div className="md:col-span-2">
                {(formatAddress() && (
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground mt-1" />
                    <span>{formatAddress()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {(staffMember?.emergency_contact_name || staffMember?.emergency_contact_phone) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {staffMember.emergency_contact_name && (
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{staffMember.emergency_contact_name}</span>
                </div>
              )}
              {staffMember.emergency_contact_phone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{staffMember.emergency_contact_phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
