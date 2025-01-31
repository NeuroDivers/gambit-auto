import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { QuoteRequestFormFields, formSchema } from "./QuoteRequestFormFields"
import { ScrollArea } from "@/components/ui/scroll-area"
import { QuoteFormHeader } from "./form-sections/QuoteFormHeader"
import { useQuoteFormSubmission } from "./form-sections/useQuoteFormSubmission"
import { useMediaUpload } from "./form-sections/useMediaUpload"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type QuoteRequestFormProps = {
  initialData?: QuoteRequestFormValues & { id: string; media_url?: string | null }
  onSuccess?: () => void
}

type QuoteRequestFormValues = z.infer<typeof formSchema>

export function QuoteRequestForm({ initialData, onSuccess }: QuoteRequestFormProps) {
  const {
    uploading,
    mediaUrl,
    handleFileUpload,
    handleMediaRemove,
    setMediaUrl
  } = useMediaUpload()

  const { data: selectedServices = [] } = useQuery({
    queryKey: ["quoteRequestServices", initialData?.id],
    enabled: !!initialData?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_request_services")
        .select("service_id")
        .eq("quote_request_id", initialData.id)
      
      if (error) throw error
      return data?.map(service => service.service_id) ?? []
    },
    initialData: []
  })

  const form = useForm<QuoteRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...(initialData || {
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
        price: 0,
      }),
      service_ids: selectedServices
    },
  })

  React.useEffect(() => {
    if (selectedServices.length > 0) {
      form.setValue("service_ids", selectedServices)
    }
  }, [selectedServices, form])

  const { handleSubmit } = useQuoteFormSubmission({
    initialData,
    mediaUrl,
    onSuccess: () => {
      form.reset()
      setMediaUrl(null)
      onSuccess?.()
    }
  })

  return (
    <ScrollArea className="h-[calc(100vh-12rem)] pr-6">
      <div className="space-y-6">
        <QuoteFormHeader isEditing={!!initialData} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
    </ScrollArea>
  )
}