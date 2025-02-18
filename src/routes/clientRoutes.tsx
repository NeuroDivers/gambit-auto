
import { ClientLayoutWrapper } from "@/components/client/ClientLayoutWrapper"
import Dashboard from "@/pages/client/Dashboard"
import QuoteRequests from "@/pages/client/QuoteRequests"
import QuoteRequestDetails from "@/pages/client/QuoteRequestDetails"
import Vehicles from "@/pages/client/Vehicles"
import Invoices from "@/pages/client/Invoices"
import ClientBookings from "@/pages/client/Bookings"
import BookingDetails from "@/pages/client/BookingDetails"
import { RouteObject } from "react-router-dom"
import PublicInvoiceView from "@/pages/PublicInvoiceView"
import ProfileSettings from "@/pages/admin/ProfileSettings"

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
      path: "invoices/:id",
      element: <PublicInvoiceView />,
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
      path: "bookings/:id",
      element: <BookingDetails />,
    },
    {
      path: "payment-methods",
      element: <div>Payment Methods</div>,
    },
    {
      path: "settings",
      element: <ProfileSettings />,
    },
  ]
}
