
import { createBrowserRouter } from "react-router-dom"
import Dashboard from "@/pages/Dashboard"
import Auth from "@/pages/Auth"
import UserDetails from "./pages/UserDetails"
import ResetPassword from "./pages/ResetPassword"
import NotFound from "./pages/NotFound"
import Unauthorized from "./pages/Unauthorized"
import PublicInvoiceView from "./pages/PublicInvoiceView"
import { protectedRoutes } from "./routes/protectedRoutes"

// Create the router
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />
  },
  {
    path: "/auth",
    element: <Auth />
  },
  {
    path: "/reset-password",
    element: <ResetPassword />
  },
  {
    path: "/user",
    element: <UserDetails />
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />
  },
  {
    path: "/p/:invoiceId",
    element: <PublicInvoiceView />
  },
  ...protectedRoutes, // Spread the protected routes array
  {
    path: "*",
    element: <NotFound />
  }
])
