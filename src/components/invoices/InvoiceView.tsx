import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceHeader } from "./sections/InvoiceHeader";
import { CustomerInfo } from "./sections/CustomerInfo";
import { VehicleInfo } from "./sections/VehicleInfo";
import { ServicesList } from "./sections/ServicesList";
import { InvoiceTotals } from "./sections/InvoiceTotals";
import { InvoiceFooter } from "./sections/InvoiceFooter";

type InvoiceViewProps = {
  invoiceId?: string;
}

export function InvoiceView({ invoiceId }: InvoiceViewProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
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
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!invoiceId
  });

  const handlePrint = useReactToPrint({
    documentTitle: 'Invoice',
    onAfterPrint: () => console.log('Printed successfully'),
    print: () => {
      if (componentRef.current) {
        return Promise.resolve(componentRef.current);
      }
      return Promise.reject('No content to print');
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card ref={componentRef} className="p-6">
        <CardContent className="space-y-6">
          <InvoiceHeader
            invoiceNumber={invoice.invoice_number}
            createdAt={invoice.created_at}
            dueDate={invoice.due_date}
          />

          <div className="grid grid-cols-2 gap-6">
            <CustomerInfo
              firstName={invoice.work_order.first_name}
              lastName={invoice.work_order.last_name}
              email={invoice.work_order.email}
              phoneNumber={invoice.work_order.phone_number}
            />

            <VehicleInfo
              year={invoice.work_order.vehicle_year}
              make={invoice.work_order.vehicle_make}
              model={invoice.work_order.vehicle_model}
              serial={invoice.work_order.vehicle_serial}
            />
          </div>

          <ServicesList services={invoice.work_order.services || []} />

          <InvoiceTotals
            subtotal={invoice.subtotal}
            taxAmount={invoice.tax_amount}
            total={invoice.total}
          />

          {invoice.notes && (
            <div className="border-t pt-4">
              <h2 className="font-semibold mb-2">Notes</h2>
              <p className="text-muted-foreground">{invoice.notes}</p>
            </div>
          )}

          <InvoiceFooter />
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button onClick={() => handlePrint()}>Print Invoice</Button>
      </div>
    </div>
  );
}