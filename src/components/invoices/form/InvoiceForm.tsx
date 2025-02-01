import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { InvoiceBasicInfo } from "./InvoiceBasicInfo"
import { InvoiceAmounts } from "./InvoiceAmounts"
import { InvoiceStatus } from "./InvoiceStatus"
import { InvoiceNotes } from "./InvoiceNotes"

type FormValues = {
  notes: string
  status: string
  invoice_number: string
  due_date: string
  subtotal: number
  tax_amount: number
  total: number
}

type InvoiceFormProps = {
  defaultValues: FormValues
  onSubmit: (values: FormValues) => void
  isSubmitting?: boolean
}

export function InvoiceForm({ defaultValues, onSubmit, isSubmitting }: InvoiceFormProps) {
  const form = useForm<FormValues>({ defaultValues })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <InvoiceBasicInfo control={form.control} />
        <InvoiceAmounts control={form.control} />
        <InvoiceStatus control={form.control} />
        <InvoiceNotes control={form.control} />

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}