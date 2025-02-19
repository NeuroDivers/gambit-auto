
import { Separator } from "@/components/ui/separator";
import { ProfileCompletionDialog } from "../profile/ProfileCompletionDialog";
import { Header } from "../shared/Header";

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
        <Header 
          firstName={firstName}
          role={role}
          onLogout={onLogout}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}
