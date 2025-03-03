
import { useState } from "react"
import { ServiceItemType } from "@/types/service-item"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { InvoiceItemsFields } from "@/components/invoices/form-sections/InvoiceItemsFields"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Estimate } from "./types"

interface QuoteFormProps {
  quoteId?: string
  requestId?: string
  defaultNote?: string
  onQuoteCreated?: () => void
  onCancel?: () => void
  // Add missing props that are being passed from dialogs
  onSuccess?: () => void
  quote?: Estimate
}

export function QuoteForm({ 
  quoteId, 
  requestId, 
  defaultNote, 
  onQuoteCreated, 
  onCancel,
  onSuccess,
  quote 
}: QuoteFormProps) {
  const [services, setServices] = useState<ServiceItemType[]>(
    // If quote exists, initialize with its items
    quote?.quote_items?.map(item => ({
      service_id: item.service_id,
      service_name: item.service_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      description: item.description || "",
      commission_rate: null,
      commission_type: null,
      package_id: undefined
    })) || []
  )
  const [note, setNote] = useState(defaultNote || quote?.notes || "")
  const [saving, setSaving] = useState(false)

  const { mutate: handleSubmitQuote } = useMutation({
    mutationFn: async () => {
      if (quote) {
        // Update existing quote
        const { data: updatedQuote, error } = await supabase
          .from('quotes')
          .update({
            notes: note
          })
          .eq('id', quote.id)
          .select()
          .single()

        if (error) throw error

        // Delete existing items and add new ones
        if (updatedQuote) {
          // First delete existing items
          const { error: deleteError } = await supabase
            .from('quote_items')
            .delete()
            .eq('quote_id', updatedQuote.id)

          if (deleteError) throw deleteError

          // Then add new items
          if (services.length > 0) {
            const { error: itemsError } = await supabase
              .from('quote_items')
              .insert(
                services.map(item => ({
                  quote_id: updatedQuote.id,
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
        }

        return updatedQuote
      } else if (requestId) {
        // Create new quote
        const { data: newQuote, error } = await supabase
          .from('quotes')
          .insert({
            quote_request_id: requestId,
            notes: note
          })
          .select()
          .single()

        if (error) throw error

        if (newQuote && services.length > 0) {
          const { error: itemsError } = await supabase
            .from('quote_items')
            .insert(
              services.map(item => ({
                quote_id: newQuote.id,
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

        return newQuote
      } else {
        throw new Error("Either quote or requestId is required")
      }
    },
    onSuccess: (data) => {
      toast.success(quote ? "Quote updated successfully" : "Quote created successfully")
      if (onQuoteCreated) {
        onQuoteCreated()
      }
      if (onSuccess) {
        onSuccess()
      }
    },
    onError: (error) => {
      console.error('Error handling quote:', error)
      toast.error(quote ? "Failed to update quote" : "Failed to create quote")
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
          {saving ? (quote ? 'Updating...' : 'Creating...') : (quote ? 'Update Quote' : 'Create Quote')}
        </Button>
      </div>
    </div>
  )
}
