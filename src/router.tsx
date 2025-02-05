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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/work-orders",
    element: <WorkOrders />,
  },
  {
    path: "/work-orders/:id",
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
    path: "*",
    element: <NotFound />,
  },
])