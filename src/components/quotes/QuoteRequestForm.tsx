import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { QuoteRequestFormFields } from "./QuoteRequestFormFields"
import { useState } from "react"

const formSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 characters"),
  contact_preference: z.enum(["phone", "email"]),
  service_id: z.string().uuid("Please select a service"),
  vehicle_make: z.string().min(2, "Vehicle make must be at least 2 characters"),
  vehicle_model: z.string().min(2, "Vehicle model must be at least 2 characters"),
  vehicle_year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicle_serial: z.string().min(2, "Vehicle serial must be at least 2 characters"),
  additional_notes: z.string().optional(),
})

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
      contact_preference: "email",
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
        .select()
        .single()

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