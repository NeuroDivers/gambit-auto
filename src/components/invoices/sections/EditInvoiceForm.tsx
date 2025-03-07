
import { useState, useEffect } from 'react';
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceFormValues, InvoiceItem } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceItemsFields } from "../form-sections/InvoiceItemsFields";
import { InvoiceNotesField } from "../form-sections/InvoiceNotesField";
import CustomerInfoFields from "@/components/invoices/form-sections/CustomerInfoFields";
import VehicleInfoFields from "../form-sections/VehicleInfoFields";
import { InvoiceStatusField } from "../form-sections/InvoiceStatusField";
import { InvoiceServiceItems } from "../form-sections/InvoiceServiceItems";
import { WorkOrderSelect } from "../form-sections/WorkOrderSelect";
import { InvoiceTaxSummary } from "../form-sections/InvoiceTaxSummary";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface EditInvoiceFormProps {
  form: UseFormReturn<InvoiceFormValues>;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
  isPending: boolean;
  invoiceId: string;
}

export function EditInvoiceForm({ form, onSubmit, isPending, invoiceId }: EditInvoiceFormProps) {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [qstAmount, setQstAmount] = useState(0);
  const [total, setTotal] = useState(0);

  // Get the business profile for tax rates
  const { data: businessProfile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profile')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: existingItems } = useQuery({
    queryKey: ['invoice-items', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);
      
      if (error) throw error;
      return data as InvoiceItem[];
    },
    enabled: !!invoiceId
  });

  useEffect(() => {
    if (existingItems && existingItems.length > 0) {
      setInvoiceItems(existingItems);
    }
  }, [existingItems]);

  // Calculate totals whenever invoice items change
  useEffect(() => {
    const calculateTotals = () => {
      const itemSubtotal = invoiceItems.reduce((sum, item) => 
        sum + (item.unit_price * item.quantity), 0);
      
      let gst = 0;
      let qst = 0;
      
      if (businessProfile) {
        const gstRate = businessProfile.gst_rate || 0;
        const qstRate = businessProfile.qst_rate || 0;
        
        gst = itemSubtotal * (gstRate / 100);
        qst = (itemSubtotal + gst) * (qstRate / 100);
      }
      
      const tax = gst + qst;
      const grandTotal = itemSubtotal + tax;
      
      setSubtotal(itemSubtotal);
      setGstAmount(gst);
      setQstAmount(qst);
      setTaxAmount(tax);
      setTotal(grandTotal);
      
      // Update form values
      form.setValue('subtotal', itemSubtotal);
      form.setValue('gst_amount', gst);
      form.setValue('qst_amount', qst);
      form.setValue('tax_amount', tax);
      form.setValue('total', grandTotal);
    };
    
    calculateTotals();
  }, [invoiceItems, businessProfile, form]);

  const handleWorkOrderSelect = async (workOrderId: string) => {
    form.setValue('work_order_id', workOrderId);
    return Promise.resolve();
  };

  const handleFormSubmit = async (data: InvoiceFormValues) => {
    try {
      // Include the invoice items
      data.invoice_items = invoiceItems;
      
      // Include calculated totals
      data.subtotal = subtotal;
      data.tax_amount = taxAmount;
      data.gst_amount = gstAmount;
      data.qst_amount = qstAmount;
      data.total = total;
      
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save invoice');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceStatusField
                value={form.watch('status')}
                onChange={(value) => form.setValue('status', value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Order</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkOrderSelect
                value={form.watch('work_order_id')}
                onChange={handleWorkOrderSelect}
                workOrders={[]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerInfoFields
                customerFirstName={form.watch('customer_first_name')}
                setCustomerFirstName={(value) => form.setValue('customer_first_name', value)}
                customerLastName={form.watch('customer_last_name')}
                setCustomerLastName={(value) => form.setValue('customer_last_name', value)}
                customerEmail={form.watch('customer_email')}
                setCustomerEmail={(value) => form.setValue('customer_email', value)}
                customerPhone={form.watch('customer_phone')}
                setCustomerPhone={(value) => form.setValue('customer_phone', value)}
                customerAddress={form.watch('customer_address')}
                setCustomerAddress={(value) => form.setValue('customer_address', value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleInfoFields
                make={form.watch('customer_vehicle_make')}
                setMake={(value) => form.setValue('customer_vehicle_make', value)}
                model={form.watch('customer_vehicle_model')}
                setModel={(value) => form.setValue('customer_vehicle_model', value)}
                year={form.watch('customer_vehicle_year')}
                setYear={(value) => form.setValue('customer_vehicle_year', value)}
                vin={form.watch('customer_vehicle_vin')}
                setVin={(value) => form.setValue('customer_vehicle_vin', value)}
                color={form.watch('customer_vehicle_color')}
                setColor={(value) => form.setValue('customer_vehicle_color', value)}
                trim={form.watch('customer_vehicle_trim')}
                setTrim={(value) => form.setValue('customer_vehicle_trim', value)}
                bodyClass={form.watch('customer_vehicle_body_class')}
                setBodyClass={(value) => form.setValue('customer_vehicle_body_class', value)}
                doors={form.watch('customer_vehicle_doors')}
                setDoors={(value) => form.setValue('customer_vehicle_doors', value)}
                licensePlate={form.watch('customer_vehicle_license_plate')}
                setLicensePlate={(value) => form.setValue('customer_vehicle_license_plate', value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceServiceItems
                invoiceId={invoiceId}
                items={invoiceItems}
                setItems={setInvoiceItems}
                allowPriceEdit={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceNotesField
                value={form.watch('notes')}
                onChange={(value) => form.setValue('notes', value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceTaxSummary
                subtotal={subtotal}
                taxAmount={taxAmount}
                gstAmount={gstAmount}
                qstAmount={qstAmount}
                total={total}
              />

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isPending}
              >
                {isPending ? 'Saving...' : 'Update Invoice'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
