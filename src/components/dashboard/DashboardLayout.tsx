
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ProfileCompletionDialog } from "../profile/ProfileCompletionDialog";
import { NavLink } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

interface DashboardLayoutProps {
  firstName?: string | null
  role?: {
    id: string
    name: string
    nicename: string
  } | null
  onLogout: () => void
  children: React.ReactNode
}

export function DashboardLayout({
  firstName,
  role,
  onLogout,
  children,
}: DashboardLayoutProps) {
  return (
    <>
      <ProfileCompletionDialog />
      <div className="flex flex-col min-h-screen">
        <header className="flex h-16 items-center px-6">
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
                  <NavLink to="/profile">
                    Profile
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <NavLink to="/settings">
                    Settings
                  </NavLink>
                </DropdownMenuItem>
                {role?.nicename === 'admin' && (
                  <DropdownMenuItem>
                    <NavLink to="/admin/users">
                      Manage Users
                    </NavLink>
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
        <Separator />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}
