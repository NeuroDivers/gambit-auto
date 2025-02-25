import { 
  Sidebar, 
  SidebarContent, 
  SidebarProvider, 
  SidebarTrigger 
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Header } from "../shared/Header"
import { DashboardSidebarNav } from "./sidebar/DashboardSidebarNav"
import { DashboardSidebarHeader } from "./sidebar/DashboardSidebarHeader"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"
import { ProfileCompletionDialog } from "../profile/ProfileCompletionDialog"
import { Menu, X } from "lucide-react"
import { Button } from "../ui/button"
import { memo } from "react"

interface DashboardLayoutProps {
  firstName?: string | null;
  role?: {
    id: string;
    name: string;
    nicename: string;
  } | null;
  onLogout: () => void;
  children: React.ReactNode;
}

// Memoize the sidebar content to prevent unnecessary re-renders
const MemoizedSidebarContent = memo(({ firstName, role, onLogout, onNavigate }: {
  firstName?: string | null;
  role?: { id: string; name: string; nicename: string; } | null;
  onLogout: () => void;
  onNavigate: () => void;
}) => (
  <SidebarContent className="flex flex-col h-full">
    <div className="py-0 px-0">
      <DashboardSidebarHeader firstName={firstName} role={role} onLogout={onLogout} />
    </div>
    <DashboardSidebarNav onNavigate={onNavigate} />
    <div className="mt-auto border-t p-4">
      <SidebarTrigger size="sm" variant="ghost" className="mx-auto" />
    </div>
  </SidebarContent>
));

MemoizedSidebarContent.displayName = 'MemoizedSidebarContent';

export function DashboardLayout({
  firstName,
  role,
  onLogout,
  children
}: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = () => setIsMobileMenuOpen(false);

  const content = isMobile ? (
    <SidebarProvider>
      <div className={cn("min-h-screen w-full bg-background text-foreground")}>
        <ProfileCompletionDialog />
        <Header firstName={firstName} role={role} onLogout={onLogout} className="flex justify-between items-center">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </Header>

        {/* Backdrop for closing menu */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
        )}

        {/* Mobile menu */}
        <div 
          className={cn(
            "fixed inset-0 bg-background z-40 transform transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="h-screen pt-16 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close Menu</span>
            </Button>
            <MemoizedSidebarContent 
              firstName={firstName} 
              role={role} 
              onLogout={onLogout}
              onNavigate={handleNavigate}
            />
          </div>
        </div>

        <main className={cn(
          "flex-1 p-4 transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "opacity-50" : "opacity-100"
        )}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  ) : (
    <SidebarProvider>
      <div 
        className={cn("flex h-screen w-full overflow-hidden bg-background")} 
        style={{
          "--sidebar-width-icon": "4rem"
        } as React.CSSProperties}
      >
        <ProfileCompletionDialog />
        <Sidebar className="border-r" collapsible="icon">
          <MemoizedSidebarContent 
            firstName={firstName} 
            role={role} 
            onLogout={onLogout}
            onNavigate={handleNavigate}
          />
          {/* <SidebarRail /> */}
        </Sidebar>
        <div className="flex-1 overflow-hidden flex flex-col">
          <Header firstName={firstName} role={role} onLogout={onLogout} />
          <main className="flex-1 overflow-auto p-4 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );

  return content;
}
