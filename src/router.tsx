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
import BusinessSettings from "./pages/BusinessSettings"
import ProfileSettings from "./pages/ProfileSettings"
import { DashboardLayout } from "./components/dashboard/DashboardLayout"
import { useNavigate } from "react-router-dom"
import { useToast } from "./hooks/use-toast"
import { supabase } from "./integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Outlet } from "react-router-dom"

const DashboardLayoutWrapper = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
      <Outlet />
    </DashboardLayout>
  );
};

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    element: <DashboardLayoutWrapper />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/work-orders",
        element: <WorkOrders />,
      },
      {
        path: "/work-orders/:id/edit",
        element: <EditWorkOrder />,
      },
      {
        path: "/service-types",
        element: <ServiceTypes />,
      },
      {
        path: "/service-bays",
        element: <ServiceBays />,
      },
      {
        path: "/users",
        element: <UserManagement />,
      },
      {
        path: "/quotes",
        element: <Quotes />,
      },
      {
        path: "/invoices",
        element: <Invoices />,
      },
      {
        path: "/invoices/:id",
        element: <InvoiceDetails />,
      },
      {
        path: "/clients",
        element: <ClientManagement />,
      },
      {
        path: "/business-settings",
        element: <BusinessSettings />,
      },
      {
        path: "/profile-settings",
        element: <ProfileSettings />,
      },
    ]
  },
  {
    path: "*",
    element: <NotFound />,
  },
])