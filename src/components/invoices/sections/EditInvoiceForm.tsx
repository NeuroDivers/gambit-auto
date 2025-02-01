import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues } from "../types"
import { InvoiceStatusField } from "../form-sections/InvoiceStatusField"
import { InvoiceNotesField } from "../form-sections/InvoiceNotesField"
import { CustomerInfoFields } from "../form-sections/CustomerInfoFields"
import { VehicleInfoFields } from "../form-sections/VehicleInfoFields"
import { InvoiceServiceItems } from "./InvoiceServiceItems"

type EditInvoiceFormProps = {
  form: UseFormReturn<InvoiceFormValues>
  onSubmit: (values: InvoiceFormValues) => void
  isPending: boolean
  invoiceId: string
}

export function EditInvoiceForm({ form, onSubmit, isPending, invoiceId }: EditInvoiceFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <InvoiceStatusField form={form} />
            <CustomerInfoFields form={form} />
          </div>
          <div className="space-y-6">
            <VehicleInfoFields form={form} />
          </div>
        </div>
        
        <InvoiceServiceItems 
          form={form}
          invoiceId={invoiceId}
        />

        <InvoiceNotesField form={form} />

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