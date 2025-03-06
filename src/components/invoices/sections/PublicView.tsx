
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Invoice } from "../types";
import { Separator } from "@/components/ui/separator";
import { InvoicePrintPreview } from "./InvoicePrintPreview";
import { ShieldCheck, AlertTriangle, InfoIcon, CreditCard, FileCheck2 } from "lucide-react";
import { EmailVerification } from "./EmailVerification";
import { PaymentSection } from "./PaymentSection";
import { useEffect } from "react";
import { format } from "date-fns";

interface PublicViewProps {
  invoice: Invoice | null;
  businessProfile: any;
  isVerified: boolean;
  setIsVerified: (verified: boolean) => void;
  isAdmin?: boolean;
  onPrint?: () => void;
  printRef?: React.RefObject<HTMLDivElement>;
}

export function PublicView({ 
  invoice, 
  businessProfile, 
  isVerified, 
  setIsVerified,
  isAdmin = false,
  onPrint,
  printRef
}: PublicViewProps) {
  const isPaid = invoice?.status === 'paid';
  const isOverdue = invoice?.status === 'overdue';
  
  const customerInfo = invoice ? {
    name: `${invoice.customer_first_name} ${invoice.customer_last_name}`,
    email: invoice.customer_email,
    phone: invoice.customer_phone || '',
    address: invoice.customer_address || ''
  } : null;

  const handleUpdate = () => {
    // This function will be triggered after a successful payment
    window.location.reload();
  };

  // Auto-verify admins
  useEffect(() => {
    if (isAdmin && !isVerified) {
      setIsVerified(true);
    }
  }, [isAdmin, isVerified, setIsVerified]);

  if (!invoice) return null;

  return (
    <div className="space-y-6">
      {!isVerified ? (
        <EmailVerification 
          customerEmail={invoice.customer_email} 
          invoiceId={invoice.id}
          onVerified={() => setIsVerified(true)}
        />
      ) : (
        <>
          {isPaid && (
            <Alert className="bg-green-50 border-green-200">
              <FileCheck2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Payment Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                This invoice has been paid in full. Thank you for your business!
              </AlertDescription>
            </Alert>
          )}

          {isOverdue && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Invoice Overdue</AlertTitle>
              <AlertDescription>
                This invoice is past due. Please make payment as soon as possible.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="shadow-md">
                <CardHeader className="bg-card/50 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Invoice #{invoice.invoice_number}</CardTitle>
                    <Badge>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</Badge>
                  </div>
                  <CardDescription>
                    {invoice.created_at && `Created on ${format(new Date(invoice.created_at), 'PPP')}`}
                    {invoice.due_date && ` • Due on ${format(new Date(invoice.due_date), 'PPP')}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="hidden md:block" ref={printRef}>
                    <InvoicePrintPreview 
                      invoice={invoice} 
                      businessProfile={businessProfile}
                    />
                  </div>
                  
                  <div className="md:hidden">
                    <Card className="bg-card/50">
                      <CardContent className="pt-4">
                        <h3 className="font-medium mb-2">From</h3>
                        <p>{businessProfile?.company_name}</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{businessProfile?.address}</p>
                      </CardContent>
                    </Card>
                    
                    <Separator className="my-4" />
                    
                    <Card className="bg-card/50">
                      <CardContent className="pt-4">
                        <h3 className="font-medium mb-2">To</h3>
                        <p>{invoice.customer_first_name} {invoice.customer_last_name}</p>
                        <p className="text-sm">{invoice.customer_email}</p>
                        {invoice.customer_phone && <p className="text-sm">{invoice.customer_phone}</p>}
                        {invoice.customer_address && <p className="text-sm text-muted-foreground">{invoice.customer_address}</p>}
                      </CardContent>
                    </Card>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      {invoice.invoice_items?.map((item, index) => (
                        <div key={index} className="border-b pb-2">
                          <div className="flex justify-between">
                            <p className="font-medium">{item.service_name}</p>
                            <p className="font-medium">${(item.quantity * item.unit_price).toFixed(2)}</p>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <p>{item.quantity} x ${item.unit_price.toFixed(2)}</p>
                          </div>
                          {item.description && <p className="text-sm mt-1">{item.description}</p>}
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <p>Subtotal</p>
                        <p>${invoice.subtotal.toFixed(2)}</p>
                      </div>
                      {invoice.gst_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <p>GST</p>
                          <p>${invoice.gst_amount.toFixed(2)}</p>
                        </div>
                      )}
                      {invoice.qst_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <p>QST</p>
                          <p>${invoice.qst_amount.toFixed(2)}</p>
                        </div>
                      )}
                      {(invoice.tax_amount > 0 && !invoice.gst_amount && !invoice.qst_amount) && (
                        <div className="flex justify-between text-sm">
                          <p>Tax</p>
                          <p>${invoice.tax_amount.toFixed(2)}</p>
                        </div>
                      )}
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <p>Total</p>
                        <p>${invoice.total.toFixed(2)}</p>
                      </div>
                    </div>

                    {invoice.notes && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h3 className="font-medium mb-2">Notes</h3>
                          <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {!isPaid && (
                <PaymentSection 
                  invoice={invoice} 
                  customerInfo={customerInfo}
                  onUpdate={handleUpdate}
                />
              )}
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Actions</h3>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full flex gap-2 items-center justify-center"
                      onClick={onPrint}
                    >
                      <FileCheck2 className="h-4 w-4" />
                      Print / Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Secure Payment</h3>
                      <p className="text-sm text-muted-foreground">Your payment information is encrypted and secure</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
