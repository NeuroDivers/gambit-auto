
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import InvoiceDetails from "@/pages/admin/InvoiceDetails"
import Invoices from "@/pages/admin/Invoices"
import CreateInvoice from "@/pages/admin/CreateInvoice"

export const invoiceRoutes = [
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
    errorElement: <ErrorBoundary />
  },
]
