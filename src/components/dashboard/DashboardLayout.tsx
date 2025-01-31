import { WelcomeHeader } from "./WelcomeHeader";
import { UserManagementSection } from "../users/UserManagementSection";
import { useAdminStatus } from "@/hooks/useAdminStatus";

export const DashboardLayout = () => {
  const { isAdmin, loading } = useAdminStatus();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white/60">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <WelcomeHeader />
      <div className="space-y-12">
        {isAdmin && (
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-[#1E1E1E] rounded-lg shadow-lg p-6 border border-white/10">
              <UserManagementSection />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};