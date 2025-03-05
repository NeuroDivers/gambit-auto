
import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "./header/NotificationDropdown";
import { UserDropdown } from "./header/UserDropdown";

interface HeaderProps {
  firstName?: string | null;
  role?: {
    id: string;
    name: string;
    nicename: string;
  } | null;
  onLogout?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function Header({ firstName, role, onLogout, className, children }: HeaderProps) {
  const isAdmin = role?.name?.toLowerCase() === 'administrator';
  
  return (
    <header className={cn("flex h-16 items-center px-6 border-b", className)}>
      {children}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg">
          Welcome, {firstName || 'Guest'}
        </span>
        {role && (
          <Badge variant="default" className="capitalize bg-primary text-primary-foreground">
            {role.nicename}
          </Badge>
        )}
      </div>
      <nav className="ml-auto flex items-center gap-4">
        <NotificationDropdown />
        <UserDropdown 
          firstName={firstName} 
          onLogout={onLogout}
          isAdmin={isAdmin}
        />
      </nav>
    </header>
  );
}
