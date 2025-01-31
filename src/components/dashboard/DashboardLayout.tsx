import { WelcomeHeader } from "./WelcomeHeader";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DashboardLayout = () => {
  const { isAdmin, loading } = useAdminStatus();
  const navigate = useNavigate();

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
            <div className="flex justify-end">
              <Button
                onClick={() => navigate("/user-management")}
                className="bg-[#BB86FC] text-white hover:bg-[#BB86FC]/90"
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};