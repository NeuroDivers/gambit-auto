import { UserManagementSection } from "@/components/users/UserManagementSection";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function UserManagement() {
  const { isAdmin, loading } = useAdminStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto px-6 py-12">
          <PageBreadcrumbs />
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5 p-8">
              <UserManagementSection />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}