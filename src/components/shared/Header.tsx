
import React from "react";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const baseRoute = isAdmin ? '/admin' : '/client';
  const initials = firstName ? firstName.charAt(0).toUpperCase() : '?';

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <NavLink to={`${baseRoute}/settings`} className="w-full">Profile Settings</NavLink>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem>
                <NavLink to="/admin/users" className="w-full">Manage Users</NavLink>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}
