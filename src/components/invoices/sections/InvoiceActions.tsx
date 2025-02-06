import { Button } from "@/components/ui/button"
import { Mail, Printer } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

type InvoiceActionsProps = {
  invoiceId?: string
  onPrint: () => void
  showEmailButton?: boolean
}

export function InvoiceActions({ invoiceId, onPrint, showEmailButton = true }: InvoiceActionsProps) {
  const [isSending, setIsSending] = useState(false)

  const handleSendEmail = async () => {
    try {
      setIsSending(true)
      const { error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoiceId }
      })
      
      if (error) throw error
      
      toast.success('Invoice sent successfully')
    } catch (error) {
      console.error('Error sending invoice:', error)
      toast.error('Failed to send invoice')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex justify-end gap-4">
      {showEmailButton && (
        <Button
          variant="outline"
          onClick={handleSendEmail}
          disabled={isSending}
          className="gap-2"
        >
          <Mail className="h-4 w-4" />
          {isSending ? 'Sending...' : 'Send Email'}
        </Button>
      )}
      <Button 
        onClick={onPrint}
        className="gap-2"
      >
        <Printer className="h-4 w-4" />
        Print Invoice
      </Button>
    </div>
  )
}