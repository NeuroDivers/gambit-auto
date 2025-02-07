
import { createBrowserRouter, Navigate } from "react-router-dom"
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
import PublicInvoiceView from "./pages/PublicInvoiceView"
import NotFound from "./pages/NotFound"
import ClientManagement from "./pages/ClientManagement"
import BusinessSettings from "./pages/BusinessSettings"
import ProfileSettings from "./pages/ProfileSettings"
import DeveloperSettings from "./pages/DeveloperSettings"
import { DashboardLayoutWrapper } from "./components/dashboard/DashboardLayoutWrapper"
import { ClientLayoutWrapper } from "./components/client/ClientLayoutWrapper"
import ClientDashboard from "./pages/client/Dashboard"
import ClientQuoteRequests from "./pages/client/QuoteRequests"
import { useAdminStatus } from "@/hooks/useAdminStatus"

// Role-based route protection component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAdminStatus()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/client" replace />
  }

  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/i/:id",
    element: <PublicInvoiceView />,
  },
  {
    path: "/",
    element: <DashboardLayoutWrapper />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "work-orders",
        element: <ProtectedRoute><WorkOrders /></ProtectedRoute>,
      },
      {
        path: "work-orders/:id/edit",
        element: <ProtectedRoute><EditWorkOrder /></ProtectedRoute>,
      },
      {
        path: "service-types",
        element: <ProtectedRoute><ServiceTypes /></ProtectedRoute>,
      },
      {
        path: "service-bays",
        element: <ProtectedRoute><ServiceBays /></ProtectedRoute>,
      },
      {
        path: "users",
        element: <ProtectedRoute><UserManagement /></ProtectedRoute>,
      },
      {
        path: "quotes",
        element: <Quotes />,
      },
      {
        path: "invoices",
        element: <ProtectedRoute><Invoices /></ProtectedRoute>,
      },
      {
        path: "invoices/:id",
        element: <ProtectedRoute><InvoiceDetails /></ProtectedRoute>,
      },
      {
        path: "clients",
        element: <ProtectedRoute><ClientManagement /></ProtectedRoute>,
      },
      {
        path: "business-settings",
        element: <BusinessSettings />,
      },
      {
        path: "profile-settings",
        element: <ProfileSettings />,
      },
      {
        path: "developer-settings",
        element: <DeveloperSettings />,
      },
    ]
  },
  {
    path: "/client",
    element: <ClientLayoutWrapper />,
    children: [
      {
        path: "",
        element: <ClientDashboard />,
      },
      {
        path: "quotes",
        element: <ClientQuoteRequests />,
      },
      {
        path: "invoices",
        element: <div>Invoices</div>,
      },
      {
        path: "bookings",
        element: <div>Bookings</div>,
      },
      {
        path: "payment-methods",
        element: <div>Payment Methods</div>,
      },
    ]
  },
  {
    path: "*",
    element: <NotFound />,
  },
])
