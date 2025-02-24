import { useCallback, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import type { QuoteRequestFormData, ServiceItemType } from "@/hooks/quote-request/formSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { formSchema } from "@/hooks/quote-request/formSchema"
import { useFormStorage } from "./quote-request/useFormStorage"
import { useMediaHandling } from "./quote-request/useMediaHandling"

export function useQuoteRequestForm() {
  const navigate = useNavigate()
  const { clearFormData: clearStoredForm } = useFormStorage()
  const [step, setStep] = useState(1)
  const { uploading, handleImageUpload, handleImageRemove, uploadedUrls } = useMediaHandling()

  // Fetch current user's default vehicle
  const { data: defaultVehicle } = useQuery({
    queryKey: ["default-vehicle"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!client) return null

      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("*")
        .eq("client_id", client.id)
        .eq("is_primary", true)
        .single()

      return vehicle
    }
  })

  const initialValues: QuoteRequestFormData = {
    vehicleInfo: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      saveToAccount: false
    },
    service_items: [] as ServiceItemType[],
    description: "",
    service_details: {}
  }

  const form = useForm<QuoteRequestFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
    mode: 'onChange'
  })

  // Update form values when default vehicle is loaded
  useEffect(() => {
    if (defaultVehicle) {
      form.setValue("vehicleInfo", {
        make: defaultVehicle.make,
        model: defaultVehicle.model,
        year: defaultVehicle.year,
        vin: defaultVehicle.vin ?? ""
      })
    }
  }, [defaultVehicle, form])

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
      
      if (error) throw error
      return data
    }
  })

  const selectedServices = form.watch('service_items')
  const totalSteps = selectedServices.length > 0 ? selectedServices.length + 2 : 2

  const onSubmit = useCallback(async (data: QuoteRequestFormData) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session) {
        toast.error("Please sign in to submit a quote request")
        navigate("/auth")
        return
      }

      // Get client ID
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle()

      if (clientError) throw clientError
      if (!clientData) {
        toast.error("No client account found")
        return
      }

      // Create quote request
      const { error: insertError } = await supabase
        .from("quote_requests")
        .insert({
          client_id: clientData.id,
          vehicle_make: data.vehicleInfo.make,
          vehicle_model: data.vehicleInfo.model,
          vehicle_year: data.vehicleInfo.year,
          vehicle_vin: data.vehicleInfo.vin,
          description: data.description,
          service_ids: data.service_items.map(item => item.service_id),
          service_details: data.service_details,
          media_urls: uploadedUrls
        })

      if (insertError) throw insertError

      // Clear form storage
      clearStoredForm()

      // Removed toast from here since it will be handled in the form component
      navigate("/client/quotes")
    } catch (error: any) {
      console.error("Error submitting quote request:", error)
      throw error // Re-throw the error to be handled by the form component
    }
  }, [navigate, clearStoredForm, uploadedUrls])

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return {
    form,
    step,
    totalSteps,
    services,
    selectedServices,
    uploading,
    isSubmitting: form.formState.isSubmitting,
    handleImageUpload,
    handleImageRemove,
    onSubmit,
    nextStep,
    prevStep
  }
}
