
import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
}

export function Header({ firstName, role, onLogout }: HeaderProps) {
  return (
    <header className="flex h-16 items-center px-6 border-b">
      <NavLink to="/dashboard" className="flex items-center gap-2">
        <LayoutDashboard className="h-6 w-6" />
        <span className="font-semibold text-lg">Acme</span>
      </NavLink>
      <nav className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                <AvatarFallback>
                  {firstName?.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <NavLink to="/profile">Profile</NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <NavLink to="/settings">Settings</NavLink>
            </DropdownMenuItem>
            {role?.nicename === 'admin' && (
              <DropdownMenuItem>
                <NavLink to="/admin/users">Manage Users</NavLink>
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
