import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { QuoteList } from "@/components/quotes/QuoteList"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

export default function Quotes() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto py-12">
          <div className="px-6">
            <div className="mb-8">
              <PageBreadcrumbs />
              <h1 className="text-3xl font-bold">Quotes</h1>
            </div>
          </div>
          <div className="max-w-[1600px] mx-auto">
            <QuoteList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}