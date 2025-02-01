import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { WorkOrderFormFields, formSchema } from "./WorkOrderFormFields"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkOrderFormHeader } from "./form-sections/WorkOrderFormHeader"
import { useWorkOrderFormSubmission } from "./form-sections/useWorkOrderFormSubmission"
import { useMediaUpload } from "./hooks/useMediaUpload"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type WorkOrderFormProps = {
  initialData?: WorkOrderFormValues & { id: string; media_url?: string | null }
  onSuccess?: () => void
}

type WorkOrderFormValues = z.infer<typeof formSchema>

export function WorkOrderForm({ initialData, onSuccess }: WorkOrderFormProps) {
  const {
    uploading,
    mediaUrl,
    handleFileUpload,
    handleMediaRemove,
    setMediaUrl
  } = useMediaUpload()

  const { data: serviceItems = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ["workOrderServices", initialData?.id],
    queryFn: async () => {
      if (!initialData?.id) return []
      
      const { data, error } = await supabase
        .from("work_order_services")
        .select(`
          service_id,
          quantity,
          unit_price,
          service_types (
            name
          )
        `)
        .eq("work_order_id", initialData.id)
      
      if (error) {
        console.error("Error fetching work order services:", error)
        return []
      }
      
      return data?.map(service => ({
        service_id: service.service_id,
        service_name: service.service_types.name,
        quantity: service.quantity,
        unit_price: service.unit_price
      })) ?? []
    },
    enabled: !!initialData?.id
  })

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...(initialData || {
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        contact_preference: "email" as const,
        service_items: [],
        vehicle_make: "",
        vehicle_model: "",
        vehicle_year: new Date().getFullYear(),
        vehicle_serial: "",
        additional_notes: "",
        timeframe: "flexible" as const,
        price: 0,
      }),
      service_items: serviceItems
    },
  })

  React.useEffect(() => {
    if (serviceItems.length > 0) {
      form.setValue("service_items", serviceItems)
    }
  }, [serviceItems, form])

  const { handleSubmit } = useWorkOrderFormSubmission({
    initialData,
    mediaUrl,
    onSuccess: () => {
      form.reset()
      setMediaUrl(null)
      onSuccess?.()
    }
  })

  if (isLoadingServices && initialData?.id) {
    return <div>Loading services...</div>
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)] pr-6">
      <div className="space-y-6">
        <WorkOrderFormHeader isEditing={!!initialData} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <WorkOrderFormFields 
              form={form} 
              onFileUpload={handleFileUpload}
              mediaUrl={mediaUrl}
              uploading={uploading}
              onMediaRemove={handleMediaRemove}
            />
            <div className="pt-6">
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? "Uploading..." : initialData ? "Update Work Order" : "Submit Work Order"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ScrollArea>
  )
}