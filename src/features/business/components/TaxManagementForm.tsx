
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const taxFormSchema = z.object({
  gst_rate: z.string().transform(val => Number(val)),
  gst_number: z.string().min(1, "GST number is required"),
  qst_rate: z.string().transform(val => Number(val)),
  qst_number: z.string().min(1, "QST number is required"),
})

type TaxFormValues = z.infer<typeof taxFormSchema>

interface TaxManagementFormProps {
  initialTaxes: any[]
}

export function TaxManagementForm({ initialTaxes }: TaxManagementFormProps) {
  const queryClient = useQueryClient()
  
  const defaultValues = {
    gst_rate: initialTaxes.find(tax => tax.tax_type === 'GST')?.tax_rate?.toString() || "0",
    gst_number: initialTaxes.find(tax => tax.tax_type === 'GST')?.tax_number || "",
    qst_rate: initialTaxes.find(tax => tax.tax_type === 'QST')?.tax_rate?.toString() || "0",
    qst_number: initialTaxes.find(tax => tax.tax_type === 'QST')?.tax_number || "",
  }

  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxFormSchema),
    defaultValues,
  })

  const { mutate: updateTaxes, isPending } = useMutation({
    mutationFn: async (values: TaxFormValues) => {
      // Update GST
      const { error: gstError } = await supabase
        .from('business_taxes')
        .upsert({
          tax_type: 'GST',
          tax_rate: values.gst_rate,
          tax_number: values.gst_number,
        }, {
          onConflict: 'tax_type'
        })

      if (gstError) throw gstError

      // Update QST
      const { error: qstError } = await supabase
        .from('business_taxes')
        .upsert({
          tax_type: 'QST',
          tax_rate: values.qst_rate,
          tax_number: values.qst_number,
        }, {
          onConflict: 'tax_type'
        })

      if (qstError) throw qstError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-taxes'] })
      toast.success("Tax settings updated successfully")
    },
    onError: (error: any) => {
      console.error("Error updating tax settings:", error)
      toast.error("Failed to update tax settings")
    }
  })

  function onSubmit(values: TaxFormValues) {
    updateTaxes(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* GST Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">GST Settings</h3>
            <FormField
              control={form.control}
              name="gst_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gst_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* QST Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">QST Settings</h3>
            <FormField
              control={form.control}
              name="qst_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>QST Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qst_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>QST Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}
