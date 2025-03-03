
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRole } from "../hooks/useUserData";
import { Badge } from "@/components/ui/badge";
import { StaffUser } from "../hooks/useStaffUserData";

interface UserAvatarProps {
  displayName: string;
  email: string;
  showEmail?: boolean;
  role?: UserRole;
  isStaffView?: boolean;
  position?: string | null;
  department?: string | null;
  status?: string | null;
}

export const UserAvatar = ({ 
  displayName, 
  email, 
  showEmail = true, 
  role,
  isStaffView = false,
  position,
  department,
  status
}: UserAvatarProps) => {
  // Extract initials from name
  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-primary/10 text-primary">
          {initials || email[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">{displayName}</h3>
          {role && (
            <Badge variant="outline" className="font-normal">
              {role.nicename}
            </Badge>
          )}
          {status && status !== 'active' && (
            <Badge variant="destructive" className="font-normal">
              {status}
            </Badge>
          )}
        </div>
        
        {showEmail && (
          <p className="text-sm text-muted-foreground">{email}</p>
        )}
        
        {isStaffView && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {position && <span>{position}</span>}
            {position && department && <span>•</span>}
            {department && <span>{department}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
