
import React from 'react';
import { Invoice } from '@/components/invoices/types';
import { MutableRefObject } from 'react';

export interface PublicViewProps {
  invoice: Invoice;
  businessProfile: any; // Adding businessProfile prop
  isVerified: boolean;
  setIsVerified: React.Dispatch<React.SetStateAction<boolean>>;
  isAdmin: boolean;
  onPrint: () => void;
  printRef: MutableRefObject<any>;
}

export function PublicView(props: PublicViewProps) {
  const { invoice, businessProfile, isVerified, setIsVerified, isAdmin, onPrint, printRef } = props;
  
  if (!invoice) {
    return <div>Loading invoice...</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6" ref={printRef}>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice #{invoice.invoice_number}</h1>
          <p className="text-gray-500">
            {new Date(invoice.created_at).toLocaleDateString()}
          </p>
        </div>
        
        {businessProfile && (
          <div className="text-right">
            <h2 className="text-xl font-semibold">{businessProfile.business_name}</h2>
            <p className="text-gray-600">{businessProfile.address}</p>
            <p className="text-gray-600">{businessProfile.phone}</p>
            <p className="text-gray-600">{businessProfile.email}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-gray-500 font-medium mb-2">Bill To:</h3>
          <p className="font-medium">
            {invoice.customer_first_name} {invoice.customer_last_name}
          </p>
          <p>{invoice.customer_email}</p>
          <p>{invoice.customer_phone}</p>
          {invoice.customer_address && <p>{invoice.customer_address}</p>}
        </div>
        
        <div>
          <h3 className="text-gray-500 font-medium mb-2">Vehicle:</h3>
          <p>
            {invoice.customer_vehicle_year} {invoice.customer_vehicle_make} {invoice.customer_vehicle_model}
          </p>
          {invoice.customer_vehicle_vin && <p>VIN: {invoice.customer_vehicle_vin}</p>}
          {invoice.customer_vehicle_color && <p>Color: {invoice.customer_vehicle_color}</p>}
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-gray-500 font-medium mb-4">Services:</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-4">Service</th>
              <th className="text-right py-2 px-4">Quantity</th>
              <th className="text-right py-2 px-4">Price</th>
              <th className="text-right py-2 px-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.invoice_items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3 px-4">{item.service_name}</td>
                <td className="text-right py-3 px-4">{item.quantity}</td>
                <td className="text-right py-3 px-4">${item.unit_price.toFixed(2)}</td>
                <td className="text-right py-3 px-4">${(item.quantity * item.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="font-medium">Subtotal:</span>
            <span>${invoice.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Tax:</span>
            <span>${((invoice.gst_amount || 0) + (invoice.qst_amount || 0)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-lg font-bold">
            <span>Total:</span>
            <span>${invoice.total?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
      
      {invoice.notes && (
        <div className="mb-8">
          <h3 className="text-gray-500 font-medium mb-2">Notes:</h3>
          <p className="text-gray-700">{invoice.notes}</p>
        </div>
      )}
      
      <div className="text-center text-gray-500 text-sm mt-12">
        <p>Thank you for your business!</p>
        {businessProfile && (
          <p className="mt-2">
            {businessProfile.business_name} • {businessProfile.address} • {businessProfile.phone}
          </p>
        )}
      </div>
      
      {!isVerified && !isAdmin && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700 text-center">
            Please verify your identity to view this invoice.
          </p>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsVerified(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Verify Identity
            </button>
          </div>
        </div>
      )}
      
      {isAdmin && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={onPrint}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Print Invoice
          </button>
        </div>
      )}
    </div>
  );
}
