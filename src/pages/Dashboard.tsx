import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { WorkOrderCalendar } from "@/components/work-orders/WorkOrderCalendar";
import { WorkOrdersSection } from "@/components/work-orders/sections/WorkOrdersSection";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate("/auth");
    }
  }, [session, navigate, sessionLoading]);

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <div className="mb-8">
            <PageBreadcrumbs />
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 gap-8">
            <WorkOrderCalendar />
            <WorkOrdersSection />
          </div>
        </div>
      </div>
    </div>
  );
}