
import CustomerInfoFields from './CustomerInfoFields';
import { InvoiceItemsFields } from './InvoiceItemsFields';
import { InvoiceNotesField } from './InvoiceNotesField';
import { InvoiceStatusField } from './InvoiceStatusField';
import { VehicleInfoFields } from './VehicleInfoFields';
import { WorkOrderSelect } from './WorkOrderSelect';
import { InvoiceTaxSummary } from './InvoiceTaxSummary';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { InvoiceItem } from "../types";
import { InvoiceServiceItems } from "./InvoiceServiceItems";

interface InvoiceFormFieldsProps {
  form: any;
  onSubmit: (values: any) => void;
  isPending?: boolean;
  invoiceId?: string;
  watch: any;
  setValue: any;
  getValues: any;
  subtotal: number;
  taxAmount: number;
  gstAmount: number;
  qstAmount: number;
  total: number;
  invoiceItems: InvoiceItem[];
  setInvoiceItems: (items: InvoiceItem[]) => void;
}

export function InvoiceFormFields({
  form,
  onSubmit,
  isPending,
  invoiceId,
  watch,
  setValue,
  getValues,
  subtotal,
  taxAmount,
  gstAmount,
  qstAmount,
  total,
  invoiceItems,
  setInvoiceItems
}: InvoiceFormFieldsProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form.getValues());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceStatusField
                value={watch('status')}
                onChange={(value) => setValue('status', value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Order</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkOrderSelect
                value={watch('work_order_id')}
                onChange={(workOrderId) => {
                  setValue('work_order_id', workOrderId);
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerInfoFields
                customerFirstName={watch('customer_first_name')}
                setCustomerFirstName={(value) => setValue('customer_first_name', value)}
                customerLastName={watch('customer_last_name')}
                setCustomerLastName={(value) => setValue('customer_last_name', value)}
                customerEmail={watch('customer_email')}
                setCustomerEmail={(value) => setValue('customer_email', value)}
                customerPhone={watch('customer_phone')}
                setCustomerPhone={(value) => setValue('customer_phone', value)}
                customerAddress={watch('customer_address')}
                setCustomerAddress={(value) => setValue('customer_address', value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleInfoFields
                make={watch('customer_vehicle_make')}
                setMake={(value) => setValue('customer_vehicle_make', value)}
                model={watch('customer_vehicle_model')}
                setModel={(value) => setValue('customer_vehicle_model', value)}
                year={watch('customer_vehicle_year')}
                setYear={(value) => setValue('customer_vehicle_year', value)}
                vin={watch('customer_vehicle_vin')}
                setVin={(value) => setValue('customer_vehicle_vin', value)}
                color={watch('customer_vehicle_color')}
                setColor={(value) => setValue('customer_vehicle_color', value)}
                trim={watch('customer_vehicle_trim')}
                setTrim={(value) => setValue('customer_vehicle_trim', value)}
                bodyClass={watch('customer_vehicle_body_class')}
                setBodyClass={(value) => setValue('customer_vehicle_body_class', value)}
                doors={watch('customer_vehicle_doors')}
                setDoors={(value) => setValue('customer_vehicle_doors', value)}
                licensePlate={watch('customer_vehicle_license_plate')}
                setLicensePlate={(value) => setValue('customer_vehicle_license_plate', value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoice Services</CardTitle>
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
              <Label htmlFor="notes">Notes (internal or for customer)</Label>
              <Textarea
                id="notes"
                value={watch('notes') || ''}
                onChange={(e) => setValue('notes', e.target.value)}
                placeholder="Enter any additional notes..."
                className="min-h-[100px]"
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
                {isPending ? 'Saving...' : invoiceId ? 'Update Invoice' : 'Create Invoice'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
