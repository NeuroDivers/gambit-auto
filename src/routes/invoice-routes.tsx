
import { RouteObject } from "react-router-dom";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import InvoiceDetails from "@/pages/admin/InvoiceDetails";
import Invoices from "@/pages/admin/Invoices";
import CreateInvoice from "@/pages/admin/CreateInvoice";
import EditInvoice from "@/pages/admin/EditInvoice";
import PublicInvoiceView from "@/pages/PublicInvoiceView";

export const invoiceRoutes: RouteObject[] = [
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
  {
    path: "invoices/:id/edit",
    element: <EditInvoice />,
    errorElement: <ErrorBoundary />
  },
  // Public route for invoice viewing
  {
    path: "public/invoice/:id",
    element: <PublicInvoiceView />,
    errorElement: <ErrorBoundary />
  }
];
