import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Dashboard from "./pages/Dashboard"
import Auth from "./pages/Auth"
import UserManagement from "./pages/UserManagement"
import WorkOrders from "./pages/WorkOrders"
import NotFound from "./pages/NotFound"
import Invoices from "./pages/Invoices"
import InvoiceDetails from "./pages/InvoiceDetails"

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/user-management",
    element: <UserManagement />,
  },
  {
    path: "/work-orders",
    element: <WorkOrders />,
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
    path: "*",
    element: <NotFound />,
  },
])

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App