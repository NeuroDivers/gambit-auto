
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ClientSidebarHeaderProps {
  firstName?: string | null;
  role?: {
    id: string;
    name: string;
    nicename: string;
  } | null;
  onLogout: () => void;
}

export function ClientSidebarHeader({ firstName, role, onLogout }: ClientSidebarHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src="/avatars/01.png" alt="Avatar" />
        <AvatarFallback>
          {firstName?.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="text-center">
        <div className="font-medium">{firstName || 'Guest'}</div>
        {role && <div className="text-sm text-muted-foreground">{role.nicename}</div>}
      </div>
    </div>
  );
}
