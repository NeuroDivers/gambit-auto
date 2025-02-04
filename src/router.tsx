import { createBrowserRouter } from "react-router-dom"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import WorkOrders from "./pages/WorkOrders"
import EditWorkOrder from "./pages/EditWorkOrder"
import UserManagement from "./pages/UserManagement"
import Invoices from "./pages/Invoices"
import InvoiceDetails from "./pages/InvoiceDetails"
import NotFound from "./pages/NotFound"
import Quotes from "./pages/Quotes"

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
    path: "/users",
    element: <UserManagement />,
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
    path: "/quotes",
    element: <Quotes />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
])