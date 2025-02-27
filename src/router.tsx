
import { createBrowserRouter } from "react-router-dom"
import { authRoutes } from "./routes/authRoutes"
import { protectedRoutes } from "./routes/protectedRoutes"
import NotFound from "./pages/NotFound"
import PublicInvoiceView from "./pages/PublicInvoiceView"
import Auth from "./pages/Auth"
import UserDetails from "./pages/UserDetails"

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
