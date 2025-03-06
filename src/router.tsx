
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
import { AuthProvider } from "./hooks/useAuth"

// Create the router with routes wrapped in AuthProvider
const routeElements = [
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
  // Add protected routes
  ...protectedRoutes,
  // Catch-all route for 404
  {
    path: "*",
    element: <NotFound />,
    errorElement: <ErrorBoundary />
  }
]

// Wrap each route element with AuthProvider
export const router = createBrowserRouter(routeElements)

// Custom wrapper function for JSX components in App.tsx
export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)
