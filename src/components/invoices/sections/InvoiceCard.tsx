
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Invoice } from "../types";
import { InvoiceDetailsCard } from "./InvoiceDetailsCard";
import { InvoiceServiceItems } from "./InvoiceServiceItems";
import { InvoiceTotals } from "./InvoiceTotals";
import { InvoiceActions } from "./InvoiceActions";
import { PrintButton } from "./PrintButton";
import { Button } from "@/components/ui/button";
import { EmailVerification } from "./EmailVerification";
import { PaymentSection } from "./PaymentSection";
import { InvoiceHeader } from "./InvoiceHeader";
import { VehicleInfoCard } from "./VehicleInfoCard";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { PrintRef } from "../types";

export interface InvoiceCardProps {
  invoice: Invoice;
  isPublic?: boolean;
  printRef?: PrintRef;
}

export function InvoiceCard({ invoice, isPublic = false, printRef }: InvoiceCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Create printable area
  if (printRef) {
    printRef.printRef = contentRef;
  }

  const isInvoiceFinal = invoice.status === "final" || invoice.is_finalized;

  return (
    <div className="space-y-6 pb-6">
      <InvoiceHeader invoice={invoice} isPublic={isPublic} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerInfoCard 
          firstName={invoice.customer_first_name}
          lastName={invoice.customer_last_name}
          email={invoice.customer_email}
          phone={invoice.customer_phone}
          address={invoice.customer_address}
        />
        
        <VehicleInfoCard
          make={invoice.customer_vehicle_make}
          model={invoice.customer_vehicle_model}
          year={invoice.customer_vehicle_year}
          vin={invoice.customer_vehicle_vin}
          color={invoice.customer_vehicle_color || invoice.vehicle_color}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Services</CardTitle>
            {(isPublic && printRef) && (
              <PrintButton 
                onClick={printRef.handlePrint} 
                label="Print Invoice" 
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div ref={contentRef}>
            <InvoiceDetailsCard 
              invoiceNumber={invoice.invoice_number}
              createdAt={invoice.created_at}
              dueDate={invoice.due_date}
              status={invoice.status}
              isFinalized={isInvoiceFinal}
            />

            <InvoiceServiceItems 
              items={invoice.invoice_items || []} 
            />

            <InvoiceTotals 
              subtotal={invoice.subtotal} 
              taxAmount={invoice.tax_amount}
              gstAmount={invoice.gst_amount}
              qstAmount={invoice.qst_amount}
              total={invoice.total}
            />

            {invoice.notes && (
              <div className="mt-8 border-t pt-4">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isPublic && (
        <>
          <EmailVerification 
            email={invoice.customer_email}
            invoiceId={invoice.id}
          />
          
          <PaymentSection 
            invoice={invoice} 
          />
        </>
      )}

      {!isPublic && (
        <InvoiceActions invoice={invoice} />
      )}
    </div>
  );
}
