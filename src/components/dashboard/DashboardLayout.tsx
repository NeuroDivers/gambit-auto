import { WelcomeHeader } from "./WelcomeHeader";
import { UserManagementSection } from "../users/UserManagementSection";
import { useAdminStatus } from "@/hooks/useAdminStatus";

export const DashboardLayout = () => {
  const { isAdmin, loading } = useAdminStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-6 py-12">
        <WelcomeHeader />
        <div className="space-y-12 mt-8">
          {isAdmin && (
            <div className="max-w-[1400px] mx-auto">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5 p-8">
                <UserManagementSection />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};