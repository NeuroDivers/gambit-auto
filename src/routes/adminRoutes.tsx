
import { DashboardLayoutWrapper } from "@/components/dashboard/DashboardLayoutWrapper"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import Dashboard from "@/pages/admin/Dashboard"
import WorkOrders from "@/pages/admin/WorkOrders"
import CreateWorkOrder from "@/pages/admin/CreateWorkOrder"
import EditWorkOrder from "@/pages/admin/EditWorkOrder"
import ServiceTypes from "@/pages/admin/ServiceTypes"
import ServiceBays from "@/pages/admin/ServiceBays"
import UserManagement from "@/pages/admin/UserManagement"
import Quotes from "@/pages/admin/Quotes"
import CreateQuote from "@/pages/admin/CreateQuote"
import QuoteDetails from "@/pages/admin/QuoteDetails"
import QuoteRequestDetails from "@/pages/admin/QuoteRequestDetails"
import Invoices from "@/pages/admin/Invoices"
import CreateInvoice from "@/pages/admin/CreateInvoice"
import InvoiceDetails from "@/pages/admin/InvoiceDetails"
import EditInvoice from "@/pages/admin/EditInvoice"
import ClientManagement from "@/pages/admin/ClientManagement"
import ClientDetails from "@/pages/admin/ClientDetails"
import BusinessSettings from "@/pages/admin/BusinessSettings"
import ProfileSettings from "@/pages/admin/ProfileSettings"
import DeveloperSettings from "@/pages/admin/DeveloperSettings"
import { RouteObject } from "react-router-dom"

export const adminRoutes: RouteObject = {
  path: "/admin",
  element: <DashboardLayoutWrapper />,
  children: [
    {
      path: "",
      element: <Dashboard />,
    },
    {
      path: "work-orders",
      element: <WorkOrders />,
    },
    {
      path: "work-orders/create",
      element: <CreateWorkOrder />,
    },
    {
      path: "work-orders/:id/edit",
      element: <EditWorkOrder />,
    },
    {
      path: "service-types",
      element: <ServiceTypes />,
    },
    {
      path: "service-bays",
      element: <ServiceBays />,
    },
    {
      path: "users",
      element: <UserManagement />,
    },
    {
      path: "quotes",
      element: <Quotes />,
    },
    {
      path: "quotes/:id",
      element: <QuoteDetails />,
    },
    {
      path: "quotes/requests/:id",
      element: <QuoteRequestDetails />,
    },
    {
      path: "quotes/create",
      element: <CreateQuote />,
    },
    {
      path: "invoices",
      element: <Invoices />,
    },
    {
      path: "invoices/create",
      element: <CreateInvoice />,
    },
    {
      path: "invoices/:id",
      element: <InvoiceDetails />,
    },
    {
      path: "invoices/:id/edit",
      element: <EditInvoice />,
    },
    {
      path: "clients",
      element: <ClientManagement />,
    },
    {
      path: "clients/:id",
      element: <ClientDetails />,
    },
    {
      path: "business-settings",
      element: <BusinessSettings />,
    },
    {
      path: "profile-settings",
      element: <ProfileSettings />,
    },
    {
      path: "developer-settings",
      element: <DeveloperSettings />,
    },
  ]
}
