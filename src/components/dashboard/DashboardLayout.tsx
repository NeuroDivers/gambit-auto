import { WelcomeHeader } from "./WelcomeHeader";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
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
    <div className="bg-gradient-to-b from-background to-background/95 min-h-screen">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <WelcomeHeader />
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/invoices")}
            >
              <FileText className="h-4 w-4" />
              Manage Invoices
            </Button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};