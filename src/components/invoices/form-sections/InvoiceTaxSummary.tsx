
import React, { useEffect, useMemo } from 'react';
import { InvoiceItem } from '../types';
import { Card, CardContent } from '@/components/ui/card';

export interface InvoiceTaxSummaryProps {
  items?: InvoiceItem[];
  onTotalCalculated?: (subtotal: number, gst: number, qst: number, total: number) => void;
  subtotal?: number;
  taxAmount?: number;
  gstAmount?: number;
  qstAmount?: number;
  total?: number;
}

export function InvoiceTaxSummary({ 
  items = [], 
  onTotalCalculated,
  subtotal: propSubtotal,
  taxAmount: propTaxAmount,
  gstAmount: propGstAmount,
  qstAmount: propQstAmount,
  total: propTotal
}: InvoiceTaxSummaryProps) {
  // Calculate values from items if not provided directly
  const { calculatedSubtotal, calculatedGst, calculatedQst, calculatedTotal } = useMemo(() => {
    if (items.length === 0) {
      return {
        calculatedSubtotal: 0,
        calculatedGst: 0,
        calculatedQst: 0,
        calculatedTotal: 0
      };
    }

    // Constants for tax rates - these should be fetched from business settings in a real app
    const GST_RATE = 0.05; // 5%
    const QST_RATE = 0.09975; // 9.975%

    const subtotal = items.reduce((acc, item) => {
      const lineTotal = (item.quantity || 0) * (item.unit_price || 0);
      return acc + lineTotal;
    }, 0);

    const gst = subtotal * GST_RATE;
    const qst = subtotal * QST_RATE;
    const total = subtotal + gst + qst;

    return {
      calculatedSubtotal: subtotal,
      calculatedGst: gst,
      calculatedQst: qst,
      calculatedTotal: total
    };
  }, [items]);

  // Use provided values or calculated ones
  const displaySubtotal = propSubtotal !== undefined ? propSubtotal : calculatedSubtotal;
  const displayGst = propGstAmount !== undefined ? propGstAmount : calculatedGst;
  const displayQst = propQstAmount !== undefined ? propQstAmount : calculatedQst;
  const displayTotal = propTotal !== undefined ? propTotal : calculatedTotal;

  // Notify parent component of calculated values if callback provided
  useEffect(() => {
    if (onTotalCalculated && items.length > 0) {
      onTotalCalculated(
        calculatedSubtotal, 
        calculatedGst, 
        calculatedQst, 
        calculatedTotal
      );
    }
  }, [calculatedSubtotal, calculatedGst, calculatedQst, calculatedTotal, items, onTotalCalculated]);

  return (
    <Card className="border border-border/20">
      <CardContent className="p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${displaySubtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST (5%)</span>
            <span>${displayGst.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">QST (9.975%)</span>
            <span>${displayQst.toFixed(2)}</span>
          </div>

          <div className="h-px bg-border my-2" />

          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${displayTotal.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
