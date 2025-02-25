
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import Quotes from "@/pages/admin/Quotes"
import CreateQuote from "@/pages/admin/CreateQuote"
import QuoteDetails from "@/pages/admin/QuoteDetails"
import QuoteRequestDetails from "@/pages/admin/QuoteRequestDetails"

export const estimateRoutes: RouteObject[] = [
  {
    path: "estimates",
    element: (
      <PermissionGuard resource="quotes" type="page_access">
        <Quotes />
      </PermissionGuard>
    ),
  },
  {
    path: "estimates/:id",
    element: (
      <PermissionGuard resource="quotes" type="page_access">
        <QuoteDetails />
      </PermissionGuard>
    ),
  },
  {
    path: "estimates/requests/:id",
    element: (
      <PermissionGuard resource="quotes" type="page_access">
        <QuoteRequestDetails />
      </PermissionGuard>
    ),
  },
  {
    path: "estimates/create",
    element: (
      <PermissionGuard resource="quotes" type="page_access">
        <CreateQuote />
      </PermissionGuard>
    ),
  },
]
