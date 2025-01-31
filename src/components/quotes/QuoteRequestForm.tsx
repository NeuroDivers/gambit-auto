import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { QuoteRequestFormFields, formSchema } from "./QuoteRequestFormFields"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

type QuoteRequestFormValues = z.infer<typeof formSchema>

type QuoteRequestFormProps = {
  initialData?: QuoteRequestFormValues & { id: string; media_url?: string | null }
}

export function QuoteRequestForm({ initialData }: QuoteRequestFormProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()
  const [mediaUrl, setMediaUrl] = useState<string | null>(initialData?.media_url || null)

  const form = useForm<QuoteRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      contact_preference: "email" as const,
      service_ids: [],
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear(),
      vehicle_serial: "",
      additional_notes: "",
      timeframe: "flexible" as const,
    },
  })

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/functions/v1/upload-quote-media', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      setMediaUrl(url)
      toast({
        title: "Success",
        description: "Media uploaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload media.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleMediaRemove = () => {
    setMediaUrl(null)
  }

  async function onSubmit(data: QuoteRequestFormValues) {
    try {
      if (initialData) {
        const { error } = await supabase
          .from("quote_requests")
          .update({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone_number: data.phone_number,
            contact_preference: data.contact_preference,
            service_ids: data.service_ids,
            vehicle_make: data.vehicle_make,
            vehicle_model: data.vehicle_model,
            vehicle_year: data.vehicle_year,
            vehicle_serial: data.vehicle_serial,
            additional_notes: data.additional_notes,
            media_url: mediaUrl,
            timeframe: data.timeframe,
          })
          .eq("id", initialData.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Quote request has been updated successfully.",
        })
      } else {
        const { error } = await supabase
          .from("quote_requests")
          .insert({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone_number: data.phone_number,
            contact_preference: data.contact_preference,
            service_ids: data.service_ids,
            vehicle_make: data.vehicle_make,
            vehicle_model: data.vehicle_model,
            vehicle_year: data.vehicle_year,
            vehicle_serial: data.vehicle_serial,
            additional_notes: data.additional_notes,
            media_url: mediaUrl,
            timeframe: data.timeframe,
          })

        if (error) throw error

        toast({
          title: "Success",
          description: "Your quote request has been submitted successfully.",
        })

        form.reset()
        setMediaUrl(null)
      }

      queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
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
        <h3 className="text-xl font-semibold mb-2 text-white/[0.87]">
          {initialData ? "Edit Quote Request" : "Request a Quote"}
        </h3>
        <p className="text-sm text-white/60">
          {initialData
            ? "Update the quote request details below"
            : "Fill out the form below to request a quote for our services"}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <QuoteRequestFormFields 
            form={form} 
            onFileUpload={handleFileUpload}
            mediaUrl={mediaUrl}
            uploading={uploading}
            onMediaRemove={handleMediaRemove}
          />
          <div className="pt-6">
            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? "Uploading..." : initialData ? "Update Request" : "Submit Request"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}