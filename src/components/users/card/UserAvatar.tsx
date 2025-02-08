
import { User, Shield } from "lucide-react";
import { UserRole } from "../hooks/useUserData";

type UserAvatarProps = {
  displayName: string;
  email: string;
  showEmail: boolean;
  role?: UserRole;
};

export const UserAvatar = ({ displayName, email, showEmail, role }: UserAvatarProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-[#BB86FC]/10 flex items-center justify-center">
        <User className="h-5 w-5 text-[#BB86FC]" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-white/[0.87]">{displayName}</p>
        <div className="flex items-center gap-2">
          {showEmail && (
            <p className="text-sm text-white/60">{email}</p>
          )}
          {role && (
            <div className="flex items-center gap-1 text-sm text-[#BB86FC]">
              <Shield className="h-3 w-3" />
              <span className="capitalize">{role.nicename} ({role.name})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
