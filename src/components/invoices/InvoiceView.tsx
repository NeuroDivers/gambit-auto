import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

export function InvoiceView() {
  const componentRef = useRef();

  const { data: invoice } = useQuery({
    queryKey: ["invoice"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          work_order:work_orders (
            *,
            services:work_order_services (
              *,
              service:service_types (*)
            )
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handlePrint = useReactToPrint({
    documentTitle: 'Invoice',
    onAfterPrint: () => console.log('Printed successfully'),
    removeAfterPrint: true,
    content: () => componentRef.current,
  });

  if (!invoice) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card ref={componentRef} className="p-6">
        <CardContent className="space-y-6">
          <div className="flex justify-between">
            <div>
              <h1 className="text-2xl font-bold">Invoice #{invoice.invoice_number}</h1>
              <p className="text-muted-foreground">Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Due Date</p>
              <p>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="font-semibold mb-2">Customer Information</h2>
            <p>{invoice.work_order.first_name} {invoice.work_order.last_name}</p>
            <p>{invoice.work_order.email}</p>
            <p>{invoice.work_order.phone_number}</p>
          </div>

          <div className="border-t pt-4">
            <h2 className="font-semibold mb-2">Vehicle Information</h2>
            <p>{invoice.work_order.vehicle_year} {invoice.work_order.vehicle_make} {invoice.work_order.vehicle_model}</p>
            <p>Serial: {invoice.work_order.vehicle_serial}</p>
          </div>

          <div className="border-t pt-4">
            <h2 className="font-semibold mb-4">Services</h2>
            <div className="space-y-2">
              {invoice.work_order.services.map((service) => (
                <div key={service.id} className="flex justify-between">
                  <span>{service.service.name}</span>
                  <span>{formatCurrency(service.service.price || 0)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="border-t pt-4">
              <h2 className="font-semibold mb-2">Notes</h2>
              <p className="text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button onClick={handlePrint}>Print Invoice</Button>
      </div>
    </div>
  );
}