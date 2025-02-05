import { createBrowserRouter } from "react-router-dom"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import WorkOrders from "./pages/WorkOrders"
import EditWorkOrder from "./pages/EditWorkOrder"
import ServiceTypes from "./pages/ServiceTypes"
import ServiceBays from "./pages/ServiceBays"
import UserManagement from "./pages/UserManagement"
import Quotes from "./pages/Quotes"
import Invoices from "./pages/Invoices"
import InvoiceDetails from "./pages/InvoiceDetails"
import NotFound from "./pages/NotFound"
import ClientManagement from "./pages/ClientManagement"
import { DashboardLayout } from "./components/dashboard/DashboardLayout"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "./integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useToast } from "./hooks/use-toast"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    navigate("/auth");
    return null;
  }

  return (
    <DashboardLayout 
      firstName={session.user?.user_metadata?.first_name} 
      role={session.user?.user_metadata?.role}
      onLogout={handleLogout}
    >
      {children}
    </DashboardLayout>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/work-orders",
    element: (
      <ProtectedRoute>
        <WorkOrders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/work-orders/:id/edit",
    element: (
      <ProtectedRoute>
        <EditWorkOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/service-types",
    element: (
      <ProtectedRoute>
        <ServiceTypes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/service-bays",
    element: (
      <ProtectedRoute>
        <ServiceBays />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute>
        <UserManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/quotes",
    element: (
      <ProtectedRoute>
        <Quotes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/invoices",
    element: (
      <ProtectedRoute>
        <Invoices />
      </ProtectedRoute>
    ),
  },
  {
    path: "/invoices/:id",
    element: (
      <ProtectedRoute>
        <InvoiceDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/clients",
    element: (
      <ProtectedRoute>
        <ClientManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
])