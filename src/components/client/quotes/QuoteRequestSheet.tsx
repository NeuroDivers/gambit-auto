
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MultiStepQuoteRequestForm } from './MultiStepQuoteRequestForm';

interface Props {
  onSuccess: () => void;
  quoteRequestForm: React.ReactNode;
}

export function QuoteRequestSheet({ onSuccess, quoteRequestForm }: Props) {
  return (
    <Sheet>
      <SheetContent className="sm:max-w-xl" side="right">
        <SheetHeader>
          <SheetTitle>Request a Quote</SheetTitle>
        </SheetHeader>
        {quoteRequestForm}
      </SheetContent>
    </Sheet>
  );
}
