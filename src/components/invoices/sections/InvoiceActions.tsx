
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, Printer, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { DeleteInvoiceDialog } from "./DeleteInvoiceDialog";

type InvoiceActionsProps = {
  invoiceId?: string;
  invoiceNumber?: string;
  onPrint: () => void;
};

export function InvoiceActions({
  invoiceId,
  invoiceNumber,
  onPrint
}: InvoiceActionsProps) {
  const [isSending, setIsSending] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { isAdmin } = useAdminStatus();

  const handleSendEmail = async () => {
    try {
      setIsSending(true);
      const {
        error
      } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          invoiceId
        }
      });
      if (error) throw error;
      toast.success('Invoice sent successfully');
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleSendEmail} disabled={isSending} className="gap-2">
          <Mail className="h-4 w-4" />
          {isSending ? 'Sending...' : 'Send Email'}
        </Button>
        <Button onClick={onPrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
        {isAdmin && invoiceId && (
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
      
      {invoiceId && invoiceNumber && (
        <DeleteInvoiceDialog
          invoiceId={invoiceId}
          invoiceNumber={invoiceNumber}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
    </>
  );
}
