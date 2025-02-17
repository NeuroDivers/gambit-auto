
import { ClientLayoutWrapper } from "@/components/client/ClientLayoutWrapper"
import ClientDashboard from "@/pages/client/Dashboard"
import ClientQuoteRequests from "@/pages/client/QuoteRequests"
import QuoteRequestDetails from "@/pages/client/QuoteRequestDetails"
import ClientVehicles from "@/pages/client/Vehicles"
import Invoices from "@/pages/Invoices"
import { RouteObject } from "react-router-dom"

export const clientRoutes: RouteObject = {
  path: "/client",
  element: <ClientLayoutWrapper />,
  children: [
    {
      path: "",
      element: <ClientDashboard />,
    },
    {
      path: "quotes",
      element: <ClientQuoteRequests />,
    },
    {
      path: "quotes/:id",
      element: <QuoteRequestDetails />,
    },
    {
      path: "invoices",
      element: <Invoices />,
    },
    {
      path: "vehicles",
      element: <ClientVehicles />,
    },
    {
      path: "bookings",
      element: <div>Bookings</div>,
    },
    {
      path: "payment-methods",
      element: <div>Payment Methods</div>,
    },
  ]
}
