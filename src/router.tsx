import { createBrowserRouter, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import UserManagement from "./pages/UserManagement";
import WorkOrders from "./pages/WorkOrders";
import NotFound from "./pages/NotFound";
import Invoices from "./pages/Invoices";
import InvoiceDetails from "./pages/InvoiceDetails";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(currentSession);
      } catch (error: any) {
        console.error("Session error:", error.message);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please try logging in again.",
        });
        window.location.href = "/auth";
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return children;
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
    path: "/user-management",
    element: (
      <ProtectedRoute>
        <UserManagement />
      </ProtectedRoute>
    ),
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
    path: "*",
    element: <NotFound />,
  },
]);