import { useReactToPrint } from 'react-to-print'
import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PrintButton } from "./sections/PrintButton"
import { InvoiceCard } from "./sections/InvoiceCard"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Mail, Printer } from "lucide-react"

type InvoiceViewProps = {
  invoiceId?: string
  isEditing?: boolean
}

type FormValues = {
  notes: string
  status: string
}

export function InvoiceView({ invoiceId, isEditing }: InvoiceViewProps) {
  const componentRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const [isSending, setIsSending] = useState(false)

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          work_order:work_orders (
            *,
            services:work_order_services (
              *,
              service:service_types (*)
            )
          )
        `)
        .eq('id', invoiceId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!invoiceId
  })

  const form = useForm<FormValues>({
    defaultValues: {
      notes: invoice?.notes || '',
      status: invoice?.status || 'draft'
    }
  })

  const updateInvoiceMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { error } = await supabase
        .from('invoices')
        .update(values)
        .eq('id', invoiceId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
      toast.success('Invoice updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update invoice')
      console.error('Error updating invoice:', error)
    }
  })

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice?.invoice_number}`,
    onAfterPrint: () => console.log('Printed successfully'),
    pageStyle: "@page { size: auto; margin: 0mm; }",
    onBeforePrint: () => {
      if (componentRef.current) {
        componentRef.current.style.background = 'white'
      }
      return Promise.resolve()
    }
  })

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

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-32 bg-muted rounded" />
      </div>
    )
  }

  if (isEditing) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => updateInvoiceMutation.mutate(values))} className="space-y-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add notes to this invoice..." 
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={updateInvoiceMutation.isPending}>
              {updateInvoiceMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    )
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto space-y-6 p-6">
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
          onClick={handlePrint}
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
      </div>
      <div ref={componentRef} className="bg-white rounded-lg shadow-lg p-8">
        <InvoiceCard invoice={invoice} />
      </div>
    </div>
  )
}