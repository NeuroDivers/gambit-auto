
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MultiStepQuoteRequestForm } from './MultiStepQuoteRequestForm';
import { UseFormReturn } from 'react-hook-form';

export interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  quoteRequestForm?: UseFormReturn<any>;
}

export function QuoteRequestSheet({ open, onOpenChange, onSuccess, quoteRequestForm }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Request a Service Quote</SheetTitle>
        </SheetHeader>
        <div className="pb-10">
          <MultiStepQuoteRequestForm onSuccess={onSuccess} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
