import { WorkOrderList } from "@/components/work-orders/WorkOrderList"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

export default function WorkOrders() {
  const { isAdmin, loading } = useAdminStatus()
  const navigate = useNavigate()
  const { toast } = useToast()

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

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/")
    }
  }, [isAdmin, loading, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto py-12">
          <div className="px-6">
            <PageBreadcrumbs />
          </div>
          <div className="max-w-[1600px] mx-auto">
            <WorkOrderList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}