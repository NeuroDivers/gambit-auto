
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { QuoteRequestFormData } from "@/components/client/quotes/form-steps/types"
import { ServiceItemType } from "@/components/work-orders/types"
import { useFormStorage } from "./quote-request/useFormStorage"
import { useMediaHandling } from "./quote-request/useMediaHandling"
import { formSchema } from "./quote-request/formSchema"
import { UseQuoteRequestFormReturn } from "./quote-request/types"

export function useQuoteRequestForm(): UseQuoteRequestFormReturn {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { loadSavedFormData, saveFormData, clearFormData } = useFormStorage()

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

  const form = useForm<QuoteRequestFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: loadSavedFormData()
  })

  form.watch((data) => {
    saveFormData(data)
  })

  const { uploading, handleImageUpload, handleImageRemove } = useMediaHandling(form)

  const selectedServices = form.watch('service_items') || []
  const totalSteps = selectedServices.length > 0 ? 2 + selectedServices.length : 2

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

      clearFormData()
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
    
    const serviceIndex = currentStep - 2;
    if (serviceIndex < selectedServices.length) {
      return currentStep + 1;
    }
    
    return totalSteps;
  }

  const getPreviousStep = (currentStep: number): number => {
    if (currentStep <= 1) return 1;
    return currentStep - 1;
  }

  const nextStep = () => {
    if (step === 1) {
      form.trigger(['vehicle_make', 'vehicle_model', 'vehicle_year', 'service_items'])
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
