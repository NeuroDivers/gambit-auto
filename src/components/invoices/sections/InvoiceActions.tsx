import { Button } from "@/components/ui/button"
import { Mail, Printer } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import * as htmlToImage from 'html-to-image'

type InvoiceActionsProps = {
  invoiceId?: string
  onPrint: () => void
}

export function InvoiceActions({ invoiceId, onPrint }: InvoiceActionsProps) {
  const [isSending, setIsSending] = useState(false)

  const handleSendEmail = async () => {
    try {
      setIsSending(true)
      
      // Get the invoice preview element with type assertion
      const invoiceElement = document.querySelector('.invoice-preview') as HTMLElement
      if (!invoiceElement) {
        throw new Error('Invoice preview element not found')
      }

      // Convert the invoice to a PNG image
      const dataUrl = await htmlToImage.toPng(invoiceElement)
      const base64Image = dataUrl.split(',')[1] // Remove the data:image/png;base64, prefix

      const { error } = await supabase.functions.invoke('send-invoice-email', {
        body: { 
          invoiceId,
          invoiceImage: base64Image
        }
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
      <Button
        variant="outline"
        onClick={handleSendEmail}
        disabled={isSending}
        className="gap-2"
      >
        <Mail className="h-4 w-4" />
        {isSending ? 'Sending...' : 'Send Email'}
      </Button>
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