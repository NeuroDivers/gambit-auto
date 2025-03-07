
import React from 'react';
import CustomerInfoFields from './CustomerInfoFields';
import VehicleInfoFields from './VehicleInfoFields';
import { InvoiceStatusField } from './InvoiceStatusField';
import { WorkOrderSelect } from './WorkOrderSelect';
import { InvoiceServiceItems } from './InvoiceServiceItems';
import { InvoiceNotesField } from './InvoiceNotesField';
import { InvoiceTaxSummary } from './InvoiceTaxSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceItem } from '../types';

export interface InvoiceFormFieldsProps {
  // Work order selection
  selectedWorkOrderId?: string;
  onWorkOrderSelect?: (workOrderId: string) => Promise<void>;
  workOrders?: any[];
  
  // Invoice items
  invoiceItems?: InvoiceItem[] | any[];
  setInvoiceItems?: React.Dispatch<React.SetStateAction<any[]>> | ((items: any[] | InvoiceItem[]) => void);
  
  // Customer fields
  firstName?: string;
  setFirstName?: (value: string) => void;
  lastName?: string;
  setLastName?: (value: string) => void;
  email?: string;
  setEmail?: (value: string) => void;
  phone?: string;
  setPhone?: (value: string) => void;
  address?: string;
  setAddress?: (value: string) => void;
  customerId?: string;
  
  // Vehicle fields
  make?: string;
  setMake?: (value: string) => void;
  model?: string;
  setModel?: (value: string) => void;
  year?: string | number;
  setYear?: (value: string | number) => void;
  vin?: string;
  setVin?: (value: string) => void;
  color?: string;
  setColor?: (value: string) => void;
  mileage?: string | number;
  setMileage?: (value: string | number) => void;
  trim?: string;
  setTrim?: (value: string) => void;
  bodyClass?: string;
  setBodyClass?: (value: string) => void;
  licensePlate?: string;
  setLicensePlate?: (value: string) => void;
  vehicleId?: string;
  
  // Financial fields
  subtotal?: number;
  setSubtotal?: (value: number) => void;
  gstAmount?: number;
  setGstAmount?: (value: number) => void;
  qstAmount?: number;
  setQstAmount?: (value: number) => void;
  taxAmount?: number;
  setTaxAmount?: (value: number) => void;
  total?: number;
  setTotal?: (value: number) => void;
  
  // Status
  status?: string;
  setStatus?: (status: string) => void;
  
  // Notes
  notes?: string;
  setNotes?: (notes: string) => void;
  
  // Invoice ID for items editing
  invoiceId?: string;
  
  // Optional flags
  readOnly?: boolean;
  showWorkOrderSelect?: boolean;
  showFinancials?: boolean;
  allowPriceEdit?: boolean;
}

export function InvoiceFormFields({
  // Work order fields
  selectedWorkOrderId,
  onWorkOrderSelect,
  workOrders,
  
  // Invoice items
  invoiceItems,
  setInvoiceItems,
  
  // Customer fields
  firstName = '',
  setFirstName,
  lastName = '',
  setLastName,
  email = '',
  setEmail,
  phone = '',
  setPhone,
  address = '',
  setAddress,
  customerId,
  
  // Vehicle fields
  make = '',
  setMake,
  model = '',
  setModel,
  year = '',
  setYear,
  vin = '',
  setVin,
  color = '',
  setColor,
  mileage = '',
  setMileage,
  trim = '',
  setTrim,
  bodyClass = '',
  setBodyClass,
  licensePlate = '',
  setLicensePlate,
  vehicleId,
  
  // Financial fields
  subtotal = 0,
  setSubtotal,
  gstAmount = 0,
  setGstAmount,
  qstAmount = 0,
  setQstAmount,
  taxAmount = 0,
  setTaxAmount,
  total = 0,
  setTotal,
  
  // Status
  status = 'draft',
  setStatus,
  
  // Notes
  notes = '',
  setNotes,
  
  // Invoice ID
  invoiceId = '',
  
  // Flags
  readOnly = false,
  showWorkOrderSelect = true,
  showFinancials = true,
  allowPriceEdit = true,
}: InvoiceFormFieldsProps) {
  
  return (
    <div className="space-y-6">
      {/* Status and Work Order Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceStatusField 
              value={status}
              onChange={setStatus}
              disabled={readOnly}
            />
          </CardContent>
        </Card>

        {/* Work Order Selection */}
        {showWorkOrderSelect && (
          <Card>
            <CardHeader>
              <CardTitle>Work Order</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkOrderSelect 
                value={selectedWorkOrderId}
                onChange={onWorkOrderSelect}
                workOrders={workOrders}
                disabled={readOnly}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerInfoFields
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            address={address}
            setAddress={setAddress}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleInfoFields
            make={make}
            setMake={setMake}
            model={model}
            setModel={setModel}
            year={year}
            setYear={setYear}
            vin={vin}
            setVin={setVin}
            color={color}
            setColor={setColor}
            mileage={mileage}
            setMileage={setMileage}
            trim={trim}
            setTrim={setTrim}
            licensePlate={licensePlate}
            setLicensePlate={setLicensePlate}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Service Items */}
      <Card>
        <CardHeader>
          <CardTitle>Service Items</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceServiceItems 
            items={invoiceItems}
            setItems={setInvoiceItems}
            allowPriceEdit={allowPriceEdit && !readOnly}
            invoiceId={invoiceId}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceNotesField 
            value={notes}
            onChange={setNotes}
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      {/* Financials */}
      {showFinancials && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceTaxSummary 
              items={invoiceItems}
              subtotal={subtotal}
              gstAmount={gstAmount}
              qstAmount={qstAmount}
              taxAmount={taxAmount}
              total={total}
              onTotalCalculated={(subtotal, gst, qst, total) => {
                setSubtotal?.(subtotal);
                setGstAmount?.(gst);
                setQstAmount?.(qst);
                setTotal?.(total);
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
