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
import { Printer } from "lucide-react";

type InvoiceViewProps = {
  invoiceId?: string;
}

export function InvoiceView({ invoiceId }: InvoiceViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

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
    documentTitle: `Invoice-${invoice?.invoice_number}`,
    onAfterPrint: () => console.log('Printed successfully'),
    print: async (printIframe: HTMLIFrameElement) => {
      const document = printIframe.contentDocument;
      if (document) {
        const html = document.getElementsByTagName("html")[0];
        html.style.background = 'none';
      }
      return true;
    }
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => handlePrint()} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      <Card ref={printRef} className="w-full bg-white shadow-lg">
        <CardContent className="p-8 space-y-8 text-[#222222]">
          <div className="relative">
            <div className="absolute right-0 top-0">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                invoice.status === 'paid' 
                  ? 'bg-[#F2FCE2] text-green-700'
                  : invoice.status === 'overdue'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-[#FEF7CD] text-yellow-700'
              }`}>
                {invoice.status.toUpperCase()}
              </div>
            </div>
            <InvoiceHeader
              invoiceNumber={invoice.invoice_number}
              createdAt={invoice.created_at}
              dueDate={invoice.due_date}
            />
          </div>

          <div className="grid grid-cols-2 gap-8 bg-[#F1F0FB] p-6 rounded-lg">
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

          <div className="bg-[#F1F0FB] p-6 rounded-lg">
            <InvoiceTotals
              subtotal={invoice.subtotal}
              taxAmount={invoice.tax_amount}
              total={invoice.total}
            />
          </div>

          {invoice.notes && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="font-semibold mb-2 text-[#222222]">Notes</h2>
              <p className="text-[#333333]">{invoice.notes}</p>
            </div>
          )}

          <InvoiceFooter />
        </CardContent>
      </Card>
    </div>
  );
}