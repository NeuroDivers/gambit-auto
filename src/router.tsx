
import { createBrowserRouter } from "react-router-dom"
import Dashboard from "@/pages/Dashboard"
import Auth from "@/pages/Auth"
import UserDetails from "./pages/UserDetails"
import ResetPassword from "./pages/ResetPassword"
import NotFound from "./pages/NotFound"
import Unauthorized from "./pages/Unauthorized"
import PublicInvoiceView from "./pages/PublicInvoiceView"
import { protectedRoutes } from "./routes/protectedRoutes"
import { ErrorBoundary } from "./components/shared/ErrorBoundary"
import { DashboardLayout } from "./components/layouts/DashboardLayout"

// Create the router
export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout><Dashboard /></DashboardLayout>,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/auth",
    element: <Auth />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/user",
    element: <UserDetails />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/p/:invoiceId",
    element: <PublicInvoiceView />,
    errorElement: <ErrorBoundary />
  },
  ...protectedRoutes,
  {
    path: "*",
    element: <NotFound />,
    errorElement: <ErrorBoundary />
  }
])
