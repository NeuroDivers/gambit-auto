import { WelcomeHeader } from "./WelcomeHeader";
import { ProfileForm } from "../profile/ProfileForm";
import { UserManagementSection } from "../users/UserManagementSection";
import { useAdminStatus } from "@/hooks/useAdminStatus";

export const DashboardLayout = () => {
  const { isAdmin, loading } = useAdminStatus();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <WelcomeHeader />
      <div className="space-y-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>
            <ProfileForm />
          </div>
        </div>
        {isAdmin && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <UserManagementSection />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};