
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
      element: (
        <PermissionGuard resource="work_orders" type="page_access">
          <WorkOrders />
        </PermissionGuard>
      ),
    },
    {
      path: "work-orders/create",
      element: (
        <PermissionGuard resource="work_orders" type="page_access">
          <CreateWorkOrder />
        </PermissionGuard>
      ),
    },
    {
      path: "work-orders/:id/edit",
      element: (
        <PermissionGuard resource="work_orders" type="page_access">
          <EditWorkOrder />
        </PermissionGuard>
      ),
    },
    {
      path: "service-types",
      element: (
        <PermissionGuard resource="service_types" type="page_access">
          <ServiceTypes />
        </PermissionGuard>
      ),
    },
    {
      path: "service-bays",
      element: (
        <PermissionGuard resource="service_bays" type="page_access">
          <ServiceBays />
        </PermissionGuard>
      ),
    },
    {
      path: "users",
      element: (
        <PermissionGuard resource="users" type="page_access">
          <UserManagement />
        </PermissionGuard>
      ),
    },
    {
      path: "quotes",
      element: (
        <PermissionGuard resource="quotes" type="page_access">
          <Quotes />
        </PermissionGuard>
      ),
    },
    {
      path: "quotes/:id",
      element: (
        <PermissionGuard resource="quotes" type="page_access">
          <QuoteDetails />
        </PermissionGuard>
      ),
    },
    {
      path: "quotes/requests/:id",
      element: (
        <PermissionGuard resource="quotes" type="page_access">
          <QuoteRequestDetails />
        </PermissionGuard>
      ),
    },
    {
      path: "quotes/create",
      element: <CreateQuote />,
    },
    {
      path: "invoices",
      element: (
        <PermissionGuard resource="invoices" type="page_access">
          <Invoices />
        </PermissionGuard>
      ),
    },
    {
      path: "invoices/create",
      element: (
        <PermissionGuard resource="invoices" type="page_access">
          <CreateInvoice />
        </PermissionGuard>
      ),
    },
    {
      path: "invoices/:id",
      element: (
        <PermissionGuard resource="invoices" type="page_access">
          <InvoiceDetails />
        </PermissionGuard>
      ),
    },
    {
      path: "invoices/:id/edit",
      element: (
        <PermissionGuard resource="invoices" type="page_access">
          <EditInvoice />
        </PermissionGuard>
      ),
    },
    {
      path: "clients",
      element: (
        <PermissionGuard resource="clients" type="page_access">
          <ClientManagement />
        </PermissionGuard>
      ),
    },
    {
      path: "business-settings",
      element: (
        <PermissionGuard resource="business_settings" type="page_access">
          <BusinessSettings />
        </PermissionGuard>
      ),
    },
    {
      path: "profile-settings",
      element: <ProfileSettings />,
    },
    {
      path: "developer-settings",
      element: (
        <PermissionGuard resource="developer_settings" type="page_access">
          <DeveloperSettings />
        </PermissionGuard>
      ),
    },
  ]
}
