
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import Invoices from "@/pages/admin/Invoices"
import CreateInvoice from "@/pages/admin/CreateInvoice"
import InvoiceDetails from "@/pages/admin/InvoiceDetails"
import EditInvoice from "@/pages/admin/EditInvoice"

export const invoiceRoutes: RouteObject[] = [
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
]
