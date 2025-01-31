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
    <div className="bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-6 py-12">
        <WelcomeHeader />
      </div>
    </div>
  );
};