
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MultiStepQuoteRequestForm } from './MultiStepQuoteRequestForm';
import { UseFormReturn } from 'react-hook-form';

export interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  quoteRequestForm?: UseFormReturn<any>;
}

export function QuoteRequestFormDialog({ open, onOpenChange, onSuccess, quoteRequestForm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Request a Service Quote</DialogTitle>
        </DialogHeader>
        <div className="pb-4">
          <MultiStepQuoteRequestForm onSuccess={onSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
