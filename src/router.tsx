
import { createBrowserRouter, Navigate } from "react-router-dom"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import WorkOrders from "./pages/WorkOrders"
import EditWorkOrder from "./pages/EditWorkOrder"
import CreateWorkOrder from "./pages/CreateWorkOrder"
import ServiceTypes from "./pages/ServiceTypes"
import ServiceBays from "./pages/ServiceBays"
import UserManagement from "./pages/UserManagement"
import Quotes from "./pages/Quotes"
import Invoices from "./pages/Invoices"
import InvoiceDetails from "./pages/InvoiceDetails"
import CreateInvoice from "./pages/CreateInvoice"
import EditInvoice from "./pages/EditInvoice"
import PublicInvoiceView from "./pages/PublicInvoiceView"
import NotFound from "./pages/NotFound"
import ClientManagement from "./pages/ClientManagement"
import BusinessSettings from "./pages/BusinessSettings"
import ProfileSettings from "./pages/ProfileSettings"
import DeveloperSettings from "./pages/DeveloperSettings"
import ResetPassword from "./pages/ResetPassword"
import { DashboardLayoutWrapper } from "./components/dashboard/DashboardLayoutWrapper"
import { ClientLayoutWrapper } from "./components/client/ClientLayoutWrapper"
import ClientDashboard from "./pages/client/Dashboard"
import ClientQuoteRequests from "./pages/client/QuoteRequests"
import ClientVehicles from "./pages/client/Vehicles"
import { PermissionGuard } from "./components/auth/PermissionGuard"
import Unauthorized from "./pages/Unauthorized"

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/auth/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/i/:id",
    element: <PublicInvoiceView />,
  },
  {
    path: "/",
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
  },
  {
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
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
