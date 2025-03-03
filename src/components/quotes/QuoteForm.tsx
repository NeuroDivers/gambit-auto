import { useState } from "react"
import { ServiceItemType } from "@/types/service-item"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { InvoiceItemsFields } from "@/components/invoices/form-sections/InvoiceItemsFields"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface QuoteFormProps {
  quoteId?: string
  requestId?: string
  defaultNote?: string
  onQuoteCreated?: () => void
  onCancel?: () => void
}

export function QuoteForm({ quoteId, requestId, defaultNote, onQuoteCreated, onCancel }: QuoteFormProps) {
  const [services, setServices] = useState<ServiceItemType[]>([])
  const [note, setNote] = useState(defaultNote || "")
  const [saving, setSaving] = useState(false)

  const { mutate: handleSubmitQuote } = useMutation({
    mutationFn: async () => {
      if (!requestId) throw new Error("Request ID is required")

      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          quote_request_id: requestId,
          notes: note
        })
        .select()
        .single()

      if (error) throw error

      if (quote && services.length > 0) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(
            services.map(item => ({
              quote_id: quote.id,
              service_id: item.service_id,
              service_name: item.service_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              description: item.description,
              commission_rate: item.commission_rate,
              commission_type: item.commission_type
            }))
          )

        if (itemsError) throw itemsError
      }

      return quote
    },
    onSuccess: (data) => {
      toast.success("Quote created successfully")
      if (onQuoteCreated) {
        onQuoteCreated()
      }
    },
    onError: (error) => {
      console.error('Error creating quote:', error)
      toast.error("Failed to create quote")
    },
    onSettled: () => {
      setSaving(false)
    }
  })

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
  }

  const handleItemsChange = (items: ServiceItemType[] | any[]) => {
    setServices(items as ServiceItemType[]);
  };

  return (
    <div className="space-y-4">
      <InvoiceItemsFields
        items={services}
        setItems={handleItemsChange}
        allowPriceEdit={true}
        showCommission={false}
      />

      <div>
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" value={note} onChange={handleNoteChange} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="button" onClick={() => {
          setSaving(true)
          handleSubmitQuote()
        }} disabled={saving}>
          {saving ? 'Creating...' : 'Create Quote'}
        </Button>
      </div>
    </div>
  )
}
