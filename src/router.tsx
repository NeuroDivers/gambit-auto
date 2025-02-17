
import { createBrowserRouter } from "react-router-dom"
import { authRoutes } from "./routes/authRoutes"
import { adminRoutes } from "./routes/adminRoutes"
import { clientRoutes } from "./routes/clientRoutes"
import NotFound from "./pages/NotFound"
import PublicInvoiceView from "./pages/PublicInvoiceView"
import Auth from "./pages/Auth"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Auth />,
  },
  ...authRoutes,
  {
    path: "/invoices/public/:id",
    element: <PublicInvoiceView />,
  },
  adminRoutes,
  clientRoutes,
  {
    path: "*",
    element: <NotFound />,
  },
])
