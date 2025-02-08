
import { User } from "lucide-react";

type UserInfoProps = {
  displayName: string;
  email: string;
  userRole?: string;
};

export const UserInfo = ({ displayName, email, userRole }: UserInfoProps) => {
  return (
    <div className="flex items-center gap-3">
      <User className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="font-medium">{displayName}</p>
        <p className="text-sm text-muted-foreground">
          {displayName !== email ? email : ''}
          {userRole && ` • ${userRole}`}
        </p>
      </div>
    </div>
  );
};
