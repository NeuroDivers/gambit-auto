import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { QuoteRequestFormFields, formSchema } from "./QuoteRequestFormFields"
import { useState } from "react"

type QuoteRequestFormValues = z.infer<typeof formSchema>

export function QuoteRequestForm() {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)

  const form = useForm<QuoteRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      contact_preference: "email" as const,
      service_id: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear(),
      vehicle_serial: "",
      additional_notes: "",
    },
  })

  async function onSubmit(data: QuoteRequestFormValues) {
    try {
      const { error } = await supabase
        .from("quote_requests")
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          contact_preference: data.contact_preference,
          service_id: data.service_id,
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_serial: data.vehicle_serial,
          additional_notes: data.additional_notes,
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Your quote request has been submitted successfully.",
      })

      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-white/[0.87]">Request a Quote</h3>
        <p className="text-sm text-white/60">
          Fill out the form below to request a quote for our services
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <QuoteRequestFormFields form={form} />
          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? "Uploading..." : "Submit Request"}
          </Button>
        </form>
      </Form>
    </div>
  )
}