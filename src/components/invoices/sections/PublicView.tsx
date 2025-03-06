
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceCard } from "./InvoiceCard";
import { PaymentSection } from "./PaymentSection";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { EmailVerification } from "./EmailVerification";
import { formatCurrency } from "@/lib/utils";
import { Lock, Shield } from "lucide-react";
import { CustomerInfo, Invoice } from "../types";

interface PublicViewProps {
  invoice: Invoice;
  verified: boolean;
  onVerified: () => void;
  children?: React.ReactNode;
}

export function PublicView({ invoice, verified, onVerified, children }: PublicViewProps) {
  const [showPayment, setShowPayment] = useState(false);
  
  if (!verified) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Secure Invoice View</h1>
          <p className="text-muted-foreground">
            This invoice is protected for your security
          </p>
        </div>
        
        <div className="flex justify-center items-center mb-8">
          <div className="p-3 rounded-full bg-amber-100">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
        </div>
        
        <EmailVerification
          email={invoice.customer_email}
          invoiceId={invoice.id}
          onVerified={onVerified}
        />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            <Shield className="h-4 w-4" />
            Your information is encrypted and secure
          </p>
        </div>
      </div>
    );
  }
  
  const handlePayNow = () => {
    setShowPayment(true);
  };
  
  const handleUpdate = () => {
    setShowPayment(false);
  };

  // Format customer info in the format expected by the PaymentSection
  const customerInfo: CustomerInfo = {
    customer_first_name: invoice.customer_first_name,
    customer_last_name: invoice.customer_last_name,
    customer_email: invoice.customer_email,
    customer_phone: invoice.customer_phone || '',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {showPayment ? (
        <PaymentSection
          customerInfo={customerInfo}
          onUpdate={handleUpdate}
          invoice={invoice}
        />
      ) : (
        <Fragment>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">Invoice #{invoice.invoice_number}</h1>
              <p className="text-muted-foreground">
                Created on{" "}
                {new Date(invoice.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <InvoiceStatusBadge status={invoice.status} />
              {invoice.status !== "paid" && (
                <Button onClick={handlePayNow}>Pay Now</Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">From</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-semibold">{invoice.company_name}</p>
                  <p>{invoice.company_email}</p>
                  <p>{invoice.company_phone}</p>
                  <p className="whitespace-pre-line">{invoice.company_address}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Bill To</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-semibold">
                    {invoice.customer_first_name} {invoice.customer_last_name}
                  </p>
                  <p>{invoice.customer_email}</p>
                  <p>{invoice.customer_phone}</p>
                  <p className="whitespace-pre-line">{invoice.customer_address}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Payment Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="flex justify-between py-1">
                    <span>Invoice #:</span>
                    <span className="font-medium">{invoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Due Date:</span>
                    <span className="font-medium">
                      {invoice.due_date
                        ? new Date(invoice.due_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Amount Due:</span>
                    <span className="font-semibold">${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <InvoiceCard invoice={invoice} />

          <div className="mt-8 bg-card rounded-lg border p-6">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {(invoice.gst_amount > 0 || invoice.qst_amount > 0) && (
              <>
                <Separator className="my-2" />
                {invoice.gst_amount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>GST {invoice.gst_number ? `(${invoice.gst_number})` : ""}</span>
                    <span>{formatCurrency(invoice.gst_amount)}</span>
                  </div>
                )}
                {invoice.qst_amount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>QST {invoice.qst_number ? `(${invoice.qst_number})` : ""}</span>
                    <span>{formatCurrency(invoice.qst_amount)}</span>
                  </div>
                )}
              </>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Notes</h3>
              <div className="bg-muted p-4 rounded-lg whitespace-pre-line">
                {invoice.notes}
              </div>
            </div>
          )}

          {invoice.status !== "paid" && (
            <div className="mt-8 flex justify-end">
              <Button onClick={handlePayNow} size="lg">
                Pay {formatCurrency(invoice.total)}
              </Button>
            </div>
          )}

          {children}
        </Fragment>
      )}
    </div>
  );
}
