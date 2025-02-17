
import { DashboardLayoutWrapper } from "@/components/dashboard/DashboardLayoutWrapper"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import Dashboard from "@/pages/Dashboard"
import WorkOrders from "@/pages/WorkOrders"
import CreateWorkOrder from "@/pages/CreateWorkOrder"
import EditWorkOrder from "@/pages/EditWorkOrder"
import ServiceTypes from "@/pages/ServiceTypes"
import ServiceBays from "@/pages/ServiceBays"
import UserManagement from "@/pages/UserManagement"
import Quotes from "@/pages/Quotes"
import CreateQuote from "@/pages/CreateQuote"
import QuoteDetails from "@/pages/QuoteDetails"
import Invoices from "@/pages/Invoices"
import CreateInvoice from "@/pages/CreateInvoice"
import InvoiceDetails from "@/pages/InvoiceDetails"
import EditInvoice from "@/pages/EditInvoice"
import ClientManagement from "@/pages/ClientManagement"
import BusinessSettings from "@/pages/BusinessSettings"
import ProfileSettings from "@/pages/ProfileSettings"
import DeveloperSettings from "@/pages/DeveloperSettings"
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
