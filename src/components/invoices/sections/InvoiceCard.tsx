
// Update just the necessary parts
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Invoice } from "../types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AlertTriangle, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InvoiceDialog } from "./InvoiceDialog";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { InvoicePrintPreview } from "./InvoicePrintPreview";

interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice.invoice_number || "draft"}`,
    onAfterPrint: () => toast({
      title: "Success",
      description: "Invoice printed successfully",
    }),
    onPrintError: () => toast({
      title: "Error",
      description: "Failed to print invoice",
      variant: "destructive",
    }),
    pageStyle: "@page { size: auto; margin: 20mm; }",
    content: () => printRef.current,
  });

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1">
                Invoice #{invoice.invoice_number}
              </h3>
              <p className="text-sm text-muted-foreground">
                {invoice.customer_first_name} {invoice.customer_last_name}
              </p>
              <div className="mt-4 space-y-2 text-sm hidden md:block">
                <p><span className="font-medium">Email:</span> {invoice.customer_email}</p>
                <p><span className="font-medium">Phone:</span> {invoice.customer_phone || "N/A"}</p>
                {(invoice.customer_vehicle_make || invoice.customer_vehicle_model) && (
                  <p><span className="font-medium">Vehicle:</span> {invoice.customer_vehicle_year} {invoice.customer_vehicle_make} {invoice.customer_vehicle_model}</p>
                )}
                {invoice.customer_vehicle_vin && (
                  <p><span className="font-medium">VIN:</span> {invoice.customer_vehicle_vin}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <div className="flex flex-col items-end">
                <Badge className="mb-2">{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</Badge>
                <p className="text-sm text-muted-foreground">
                  {invoice.created_at
                    ? format(new Date(invoice.created_at), "MMM d, yyyy")
                    : "Draft"}
                </p>
                {invoice.due_date && (
                  <div className="flex items-center gap-1 text-sm mt-1">
                    <span>Due:</span>
                    <span className="font-medium">
                      {format(new Date(invoice.due_date), "MMM d, yyyy")}
                    </span>
                    {new Date(invoice.due_date) < new Date() && invoice.status !== "paid" && (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-base font-bold text-right">
                  ${invoice.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex gap-1 items-center"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Print</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowDetails(true)}
              className="flex gap-1 items-center"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden md:inline">View</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <InvoiceDialog
        invoiceId={invoice.id}
        open={showDetails}
        onOpenChange={setShowDetails}
      />

      <div className="hidden">
        <div ref={printRef}>
          <InvoicePrintPreview
            invoice={invoice}
            businessProfile={null}
          />
        </div>
      </div>
    </>
  );
}
