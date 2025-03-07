import React from 'react';
import CustomerInfoFields from '@/components/invoices/form-sections/CustomerInfoFields';
import { InvoiceStatusField } from './InvoiceStatusField';
import { WorkOrderSelect } from './WorkOrderSelect';
import { InvoiceServiceItems } from '../sections/InvoiceServiceItems';
import { InvoiceNotesField } from './InvoiceNotesField';
import { InvoiceTaxSummary } from './InvoiceTaxSummary';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VehicleInfoFields } from '@/components/shared/form-fields/VehicleInfoFields';
import { InvoiceItem } from '../types';

export interface InvoiceFormFieldsProps {
  // Customer info
  customerFirstName: string;
  setCustomerFirstName: (value: string) => void;
  customerLastName: string;
  setCustomerLastName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  // Status
  status: string;
  setStatus: (value: string) => void;
  // Work order
  selectedWorkOrderId?: string;
  onWorkOrderSelect?: (workOrderId: string) => Promise<void>;
  workOrders?: any[];
  // Vehicle info
  vehicleMake: string;
  setVehicleMake: (value: string) => void;
  vehicleModel: string;
  setVehicleModel: (value: string) => void;
  vehicleYear: string | number;
  setVehicleYear: (value: string | number) => void;
  vehicleVin: string;
  setVehicleVin: (value: string) => void;
  vehicleColor?: string;
  setVehicleColor?: (value: string) => void;
  vehicleTrim?: string;
  setVehicleTrim?: (value: string) => void;
  vehicleBodyClass?: string;
  setVehicleBodyClass?: (value: string) => void;
  vehicleDoors?: string | number;
  setVehicleDoors?: (value: string | number) => void;
  vehicleLicensePlate?: string;
  setVehicleLicensePlate?: (value: string) => void;
  // Invoice items
  invoiceItems: InvoiceItem[];
  setInvoiceItems: (items: InvoiceItem[] | any[]) => void;
  // Notes
  notes: string;
  setNotes: (value: string) => void;
  // Other props
  invoiceId?: string;
  subtotal?: number;
  taxAmount?: number;
  gstAmount?: number;
  qstAmount?: number;
  total?: number;
}

export function InvoiceFormFields({
  // Customer info
  customerFirstName,
  setCustomerFirstName,
  customerLastName,
  setCustomerLastName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  // Status
  status,
  setStatus,
  // Work order
  selectedWorkOrderId,
  onWorkOrderSelect,
  workOrders,
  // Vehicle info
  vehicleMake,
  setVehicleMake,
  vehicleModel,
  setVehicleModel,
  vehicleYear,
  setVehicleYear,
  vehicleVin,
  setVehicleVin,
  vehicleColor,
  setVehicleColor,
  vehicleTrim,
  setVehicleTrim,
  vehicleBodyClass,
  setVehicleBodyClass,
  vehicleDoors,
  setVehicleDoors,
  vehicleLicensePlate,
  setVehicleLicensePlate,
  // Invoice items
  invoiceItems,
  setInvoiceItems,
  // Notes
  notes,
  setNotes,
  // Other props
  invoiceId = '',
  subtotal = 0,
  taxAmount = 0,
  gstAmount = 0,
  qstAmount = 0,
  total = 0
}: InvoiceFormFieldsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Status</h3>
        <InvoiceStatusField
          value={status}
          onChange={(value) => setStatus(value)}
        />
      </div>

      {workOrders && onWorkOrderSelect && (
        <div>
          <h3 className="text-lg font-medium mb-4">Work Order</h3>
          <WorkOrderSelect
            value={selectedWorkOrderId}
            onChange={(workOrderId) => onWorkOrderSelect(workOrderId)}
            workOrders={workOrders}
          />
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium mb-4">Customer Information</h3>
        <CustomerInfoFields
          customerFirstName={customerFirstName}
          setCustomerFirstName={setCustomerFirstName}
          customerLastName={customerLastName}
          setCustomerLastName={setCustomerLastName}
          customerEmail={customerEmail}
          setCustomerEmail={setCustomerEmail}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Vehicle Information</h3>
        <VehicleInfoFields
          make={vehicleMake}
          setMake={setVehicleMake}
          model={vehicleModel}
          setModel={setVehicleModel}
          year={vehicleYear}
          setYear={setVehicleYear}
          vin={vehicleVin}
          setVin={setVehicleVin}
          color={vehicleColor}
          setColor={setVehicleColor}
          trim={vehicleTrim}
          setTrim={setVehicleTrim}
          bodyClass={vehicleBodyClass}
          setBodyClass={setVehicleBodyClass}
          doors={vehicleDoors}
          setDoors={setVehicleDoors}
          licensePlate={vehicleLicensePlate}
          setLicensePlate={setVehicleLicensePlate}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Services</h3>
        <InvoiceServiceItems
          invoiceId={invoiceId}
          items={invoiceItems}
          setItems={setInvoiceItems}
          allowPriceEdit={true}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Notes</h3>
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional information..."
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Summary</h3>
        <InvoiceTaxSummary
          subtotal={subtotal}
          taxAmount={taxAmount}
          gstAmount={gstAmount}
          qstAmount={qstAmount}
          total={total}
          items={invoiceItems}
        />
      </div>
    </div>
  );
}
