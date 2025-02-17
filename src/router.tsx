
import { createBrowserRouter } from "react-router-dom"
import { authRoutes } from "./routes/authRoutes"
import { dashboardRoutes } from "./routes/dashboardRoutes"
import { clientRoutes } from "./routes/clientRoutes"
import NotFound from "./pages/NotFound"
import PublicInvoiceView from "./pages/PublicInvoiceView"

export const router = createBrowserRouter([
  ...authRoutes,
  {
    path: "/invoices/public/:id",
    element: <PublicInvoiceView />,
  },
  dashboardRoutes,
  clientRoutes,
  {
    path: "*",
    element: <NotFound />,
  },
])
