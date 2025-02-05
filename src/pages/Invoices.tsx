import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { InvoiceList } from "@/components/invoices/InvoiceList"
import { Button } from "@/components/ui/button"
import { FilePlus, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { useToast } from "@/hooks/use-toast"

export default function Invoices() {
  const navigate = useNavigate()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      return { ...profileData, role: roleData?.role };
    },
  });

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
    <DashboardLayout 
      firstName={profile?.first_name}
      role={profile?.role}
      onLogout={handleLogout}
    >
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto py-12">
          <div className="px-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <PageBreadcrumbs />
                <h1 className="text-3xl font-bold">Invoices</h1>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setCreateDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Quick Create
                </Button>
                <Button 
                  onClick={() => navigate("/work-orders")} 
                  variant="outline"
                  className="gap-2"
                >
                  <FilePlus className="h-4 w-4" />
                  Create from Work Order
                </Button>
              </div>
            </div>
          </div>
          <div className="max-w-[1600px] mx-auto">
            <InvoiceList />
          </div>
        </div>
        <CreateInvoiceDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </DashboardLayout>
  )
}