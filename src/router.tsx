
import { createBrowserRouter } from "react-router-dom"
import { authRoutes } from "./routes/authRoutes"
import { protectedRoutes } from "./routes/protectedRoutes"
import NotFound from "./pages/NotFound"
import PublicInvoiceView from "./pages/PublicInvoiceView"
import Auth from "./pages/Auth"
import UserDetails from "./pages/UserDetails"
import VinScannerPage from "./pages/admin/VinScannerPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Auth />,
    index: true
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/users/:id",
    element: <UserDetails />,
  },
  {
    path: "/admin/vin-scanner",
    element: <VinScannerPage />,
  },
  ...authRoutes,
  {
    path: "/invoices/public/:id",
    element: <PublicInvoiceView />,
  },
  protectedRoutes,
  {
    path: "*",
    element: <NotFound />,
  },
])
