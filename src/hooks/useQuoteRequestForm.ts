
import { useState } from "react"
import { UseFormReturn, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { QuoteRequestFormData } from "@/components/client/quotes/form-steps/types"
import { ServiceItemType } from "@/components/work-orders/types"

const formSchema = z.object({
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.string().min(4, "Valid year required"),
  vehicle_vin: z.string().optional(),
  service_items: z.array(z.object({
    service_id: z.string(),
    service_name: z.string(),
    quantity: z.number(),
    unit_price: z.number()
  })).min(1, "Please select at least one service"),
  description: z.string().optional(),
  service_details: z.record(z.any())
})

const STORAGE_KEY = 'quote_request_form_data'

export function useQuoteRequestForm() {
  const [step, setStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select(`
          *,
          service_packages (
            id,
            name,
            description,
            price,
            status
          )
        `)
        .eq('status', 'active')
      
      if (error) throw error
      return data
    }
  })

  // Load saved form data from localStorage
  const loadSavedFormData = () => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        return JSON.parse(savedData)
      } catch (error) {
        console.error('Error parsing saved form data:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    return {
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear().toString(),
      vehicle_vin: "",
      service_items: [],
      description: "",
      service_details: {}
    }
  }

  const form = useForm<QuoteRequestFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: loadSavedFormData()
  })

  // Save form data to localStorage whenever it changes
  const saveFormData = (data: any) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  // Subscribe to form changes
  form.watch((data) => {
    saveFormData(data)
  })

  const selectedServices = form.watch('service_items') || []
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
      
      const serviceItems = values.service_items.map((item: ServiceItemType) => ({
        service_id: item.service_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
      
      const { error: requestError } = await supabase
        .from('quote_requests')
        .insert([{
          client_id: user.id,
          status: 'pending',
          vehicle_make: values.vehicle_make,
          vehicle_model: values.vehicle_model,
          vehicle_year: parseInt(values.vehicle_year),
          vehicle_vin: values.vehicle_vin || null,
          service_items: serviceItems,
          service_details: values.service_details
        }])

      if (requestError) throw requestError

      // Clear saved form data after successful submission
      localStorage.removeItem(STORAGE_KEY)
      
      toast.success("Quote request submitted successfully")
      form.reset()
      setStep(1)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getNextStep = (currentStep: number): number => {
    if (currentStep === 1) return 2;
    if (currentStep === 2) return 3;
    
    // For service detail steps
    const serviceIndex = currentStep - 3;
    if (serviceIndex < selectedServices.length) {
      return currentStep + 1;
    }
    
    // If there are no more services, go to summary
    return totalSteps;
  }

  const getPreviousStep = (currentStep: number): number => {
    if (currentStep <= 1) return 1;
    return currentStep - 1;
  }

  const nextStep = () => {
    if (step === 1) {
      form.trigger(['vehicle_make', 'vehicle_model', 'vehicle_year'])
        .then((isValid) => {
          if (isValid) setStep(getNextStep(step))
        })
    } else if (step === 2) {
      form.trigger('service_items')
        .then((isValid) => {
          if (isValid) setStep(getNextStep(step))
        })
    } else {
      setStep(getNextStep(step))
    }
  }

  const prevStep = () => setStep(getPreviousStep(step))

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
