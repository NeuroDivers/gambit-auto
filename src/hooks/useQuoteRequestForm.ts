
import { useState } from "react"
import { UseFormReturn, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { QuoteRequestFormData } from "@/components/client/quotes/form-steps/types"

const formSchema = z.object({
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.string().min(4, "Valid year required"),
  vehicle_vin: z.string().optional(),
  service_ids: z.array(z.string()).min(1, "Please select at least one service"),
  description: z.string().optional(),
  service_details: z.record(z.any())
})

export function useQuoteRequestForm() {
  const [step, setStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('status', 'active')
      
      if (error) throw error
      return data
    }
  })

  const form = useForm<QuoteRequestFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear().toString(),
      vehicle_vin: "",
      service_ids: [],
      description: "",
      service_details: {}
    }
  })

  const selectedServices = form.watch('service_ids')
  const totalSteps = selectedServices.length > 0 ? 3 + selectedServices.length : 3

  const handleImageUpload = async (files: FileList, serviceId: string) => {
    try {
      setUploading(true)
      const newUrls: string[] = []

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${crypto.randomUUID()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('quote-request-media')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('quote-request-media')
          .getPublicUrl(filePath)

        newUrls.push(publicUrl)
      }

      const currentDetails = form.getValues(`service_details.${serviceId}`) || {}
      const currentImages = currentDetails.images || []
      
      form.setValue(`service_details.${serviceId}`, {
        ...currentDetails,
        images: [...currentImages, ...newUrls]
      })

      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`)
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (url: string, serviceId: string) => {
    try {
      const urlPath = url.split('/').pop()
      if (!urlPath) return

      const { error: deleteError } = await supabase.storage
        .from('quote-request-media')
        .remove([urlPath])

      if (deleteError) throw deleteError

      const currentDetails = form.getValues(`service_details.${serviceId}`)
      const currentImages = currentDetails?.images || []
      
      form.setValue(`service_details.${serviceId}`, {
        ...currentDetails,
        images: currentImages.filter((image: string) => image !== url)
      })

      toast.success('Image removed successfully')
    } catch (error: any) {
      toast.error('Error removing image: ' + error.message)
    }
  }

  const onSubmit = async (values: QuoteRequestFormData) => {
    try {
      setIsSubmitting(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")
      
      const { error: requestError } = await supabase
        .from('quote_requests')
        .insert([{
          client_id: user.id,
          status: 'pending',
          vehicle_make: values.vehicle_make,
          vehicle_model: values.vehicle_model,
          vehicle_year: parseInt(values.vehicle_year),
          vehicle_vin: values.vehicle_vin || null,
          service_ids: values.service_ids,
          service_details: values.service_details
        }])

      if (requestError) throw requestError

      toast.success("Quote request submitted successfully")
      form.reset()
      setStep(1)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (step === 1) {
      form.trigger(['vehicle_make', 'vehicle_model', 'vehicle_year'])
        .then((isValid) => {
          if (isValid) setStep(step + 1)
        })
    } else if (step === 2) {
      form.trigger('service_ids')
        .then((isValid) => {
          if (isValid) setStep(step + 1)
        })
    } else {
      setStep(step + 1)
    }
  }

  const prevStep = () => setStep(step - 1)

  return {
    form,
    step,
    totalSteps,
    services,
    selectedServices,
    uploading,
    isSubmitting,
    handleImageUpload,
    handleImageRemove,
    onSubmit,
    nextStep,
    prevStep
  }
}
