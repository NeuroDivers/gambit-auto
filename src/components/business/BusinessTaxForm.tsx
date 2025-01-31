import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const taxFormSchema = z.object({
  tax_type: z.enum(["GST", "QST", "HST", "PST"]),
  tax_number: z.string().min(1, "Tax number is required"),
  tax_rate: z.string().transform((val) => parseFloat(val)),
})

type TaxFormValues = z.infer<typeof taxFormSchema>

export function BusinessTaxForm() {
  const { toast } = useToast()

  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profile")
        .select("id")
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
  })

  const { data: taxes, refetch } = useQuery({
    queryKey: ["business-taxes"],
    queryFn: async () => {
      if (!businessProfile?.id) return []
      
      const { data, error } = await supabase
        .from("business_taxes")
        .select("*")
        .eq("business_id", businessProfile.id)

      if (error) throw error
      return data
    },
    enabled: !!businessProfile?.id,
  })

  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: {
      tax_type: "GST",
      tax_number: "",
      tax_rate: "0",
    },
  })

  async function onSubmit(data: TaxFormValues) {
    if (!businessProfile?.id) {
      toast({
        title: "Error",
        description: "Business profile not found",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from("business_taxes")
        .upsert({
          business_id: businessProfile.id,
          tax_type: data.tax_type,
          tax_number: data.tax_number,
          tax_rate: data.tax_rate,
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Tax information updated successfully.",
      })
      
      form.reset()
      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {taxes?.map((tax) => (
          <div key={tax.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">{tax.tax_type}</p>
              <p className="text-sm text-gray-500">Number: {tax.tax_number}</p>
              <p className="text-sm text-gray-500">Rate: {tax.tax_rate}%</p>
            </div>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from("business_taxes")
                    .delete()
                    .eq("id", tax.id)

                  if (error) throw error

                  toast({
                    title: "Success",
                    description: "Tax information deleted successfully.",
                  })
                  
                  refetch()
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                  })
                }
              }}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="tax_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GST">GST</SelectItem>
                    <SelectItem value="QST">QST</SelectItem>
                    <SelectItem value="HST">HST</SelectItem>
                    <SelectItem value="PST">PST</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Rate (%)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Add Tax Information</Button>
        </form>
      </Form>
    </div>
  )
}