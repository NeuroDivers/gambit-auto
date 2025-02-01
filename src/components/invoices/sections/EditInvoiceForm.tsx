import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { InvoiceServiceItems } from "./InvoiceServiceItems"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type FormValues = {
  notes: string
  status: string
  invoice_items: Array<{
    service_name: string
    description: string
    quantity: number
    unit_price: number
  }>
}

type EditInvoiceFormProps = {
  form: UseFormReturn<FormValues>
  onSubmit: (values: FormValues) => void
  isPending: boolean
  invoiceId: string
}

export function EditInvoiceForm({ form, onSubmit, isPending, invoiceId }: EditInvoiceFormProps) {
  const { data: invoiceItems } = useQuery({
    queryKey: ["invoice-items", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId)

      if (error) throw error
      return data
    },
    enabled: !!invoiceId
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        
        <InvoiceServiceItems 
          form={form}
          invoiceItems={invoiceItems || []}
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
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}