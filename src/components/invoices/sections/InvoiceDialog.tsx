import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InvoiceView } from "@/components/invoices/InvoiceView";

export interface InvoiceDialogProps {
  invoiceId: string;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
}

export function InvoiceDialog({ invoiceId, open, onOpenChange, onClose }: InvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <InvoiceView invoiceId={invoiceId} />
      </DialogContent>
    </Dialog>
  );
}
