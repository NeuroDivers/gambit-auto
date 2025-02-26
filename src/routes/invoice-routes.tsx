import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import InvoiceDetails from "@/pages/admin/InvoiceDetails"
import InvoiceList from "@/pages/admin/InvoiceList"
import InvoiceCreate from "@/pages/admin/InvoiceCreate"

export const invoiceRoutes = [
  {
    path: "invoices",
    element: <InvoiceList />,
  },
  {
    path: "invoices/create",
    element: <InvoiceCreate />,
  },
  {
    path: "invoices/:id",
    element: <InvoiceDetails />,
    errorElement: <ErrorBoundary />
  },
]
