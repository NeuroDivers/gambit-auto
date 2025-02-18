
import { ClientLayoutWrapper } from "@/components/client/ClientLayoutWrapper"
import Dashboard from "@/pages/client/Dashboard"
import QuoteRequests from "@/pages/client/QuoteRequests"
import QuoteRequestDetails from "@/pages/client/QuoteRequestDetails"
import Vehicles from "@/pages/client/Vehicles"
import Invoices from "@/pages/client/Invoices"
import ClientBookings from "@/pages/client/Bookings"
import { RouteObject } from "react-router-dom"

export const clientRoutes: RouteObject = {
  path: "/client",
  element: <ClientLayoutWrapper />,
  children: [
    {
      path: "",
      element: <Dashboard />,
    },
    {
      path: "quotes",
      element: <QuoteRequests />,
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
      element: <Vehicles />,
    },
    {
      path: "bookings",
      element: <ClientBookings />,
    },
    {
      path: "payment-methods",
      element: <div>Payment Methods</div>,
    },
  ]
}
