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
import PublicInvoiceView from "./pages/PublicInvoiceView"
import NotFound from "./pages/NotFound"
import ClientManagement from "./pages/ClientManagement"
import BusinessSettings from "./pages/BusinessSettings"
import ProfileSettings from "./pages/ProfileSettings"
import DeveloperSettings from "./pages/DeveloperSettings"
import { DashboardLayoutWrapper } from "./components/dashboard/DashboardLayoutWrapper"

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
      {
        path: "/developer-settings",
        element: <DeveloperSettings />,
      },
    ]
  },
  {
    path: "*",
    element: <NotFound />,
  },
])