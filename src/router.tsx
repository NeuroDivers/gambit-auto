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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout><Dashboard /></DashboardLayout>,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/work-orders",
    element: <DashboardLayout><WorkOrders /></DashboardLayout>,
  },
  {
    path: "/work-orders/:id",
    element: <DashboardLayout><EditWorkOrder /></DashboardLayout>,
  },
  {
    path: "/service-types",
    element: <DashboardLayout><ServiceTypes /></DashboardLayout>,
  },
  {
    path: "/service-bays",
    element: <DashboardLayout><ServiceBays /></DashboardLayout>,
  },
  {
    path: "/users",
    element: <DashboardLayout><UserManagement /></DashboardLayout>,
  },
  {
    path: "/quotes",
    element: <DashboardLayout><Quotes /></DashboardLayout>,
  },
  {
    path: "/invoices",
    element: <DashboardLayout><Invoices /></DashboardLayout>,
  },
  {
    path: "/invoices/:id",
    element: <DashboardLayout><InvoiceDetails /></DashboardLayout>,
  },
  {
    path: "/clients",
    element: <DashboardLayout><ClientManagement /></DashboardLayout>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
])