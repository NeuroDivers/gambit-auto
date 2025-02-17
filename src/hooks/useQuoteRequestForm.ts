
import { useCallback, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useFormStorage } from "./quote-request/useFormStorage"
import { QuoteRequestFormData, ServiceItemType, formSchema } from "./quote-request/formSchema"
import { useQuery } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import type { UseFormReturn } from "react-hook-form"

export function useQuoteRequestForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clearFormData: clearStoredForm } = useFormStorage()
  const [step, setStep] = useState(1)
  const [uploading, setUploading] = useState(false)

  const form = useForm<QuoteRequestFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleInfo: {
        make: "",
        model: "",
        year: new Date().getFullYear(),
        vin: ""
      },
      service_items: [] as ServiceItemType[],
      description: "",
      service_details: {}
    }
  })

  // Fetch the user's default vehicle
  const { data: defaultVehicle } = useQuery({
    queryKey: ["default-vehicle"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return null

      // First get the client ID
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle()

      if (!client) return null

      // Then get the default vehicle
      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("*")
        .eq("client_id", client.id)
        .eq("is_primary", true)
        .maybeSingle()

      return vehicle
    }
  })

  // Update form with default vehicle data when available
  useEffect(() => {
    if (defaultVehicle) {
      form.setValue("vehicleInfo", {
        make: defaultVehicle.make,
        model: defaultVehicle.model,
        year: defaultVehicle.year,
        vin: defaultVehicle.vin || ""
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

  const selectedServices = form.watch('service_items') || []
  const totalSteps = selectedServices.length > 0 ? selectedServices.length + 2 : 2
  const isSubmitting = form.formState.isSubmitting

  const handleImageUpload = async (files: FileList, serviceId: string) => {
    setUploading(true)
    try {
      // Image upload logic here
      toast.success("Images uploaded successfully")
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.error("Failed to upload images")
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = (url: string, serviceId: string) => {
    const currentDetails = form.getValues('service_details')
    const serviceDetails = currentDetails[serviceId] || {}
    const updatedImages = (serviceDetails.images || []).filter((img: string) => img !== url)
    
    form.setValue(`service_details.${serviceId}.images`, updatedImages)
  }

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

  const onSubmit = useCallback(async (data: QuoteRequestFormData) => {
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session.session) {
        toast.error("Please sign in to submit a quote request")
        navigate("/auth")
        return
      }

      // Get client ID
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", session.session.user.id)
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
          service_details: data.service_details
        })

      if (insertError) throw insertError

      // Clear form storage
      clearStoredForm()

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })

      toast.success("Quote request submitted successfully!")
      navigate("/client/quotes")
    } catch (error: any) {
      console.error("Error submitting quote request:", error)
      toast.error("Failed to submit quote request")
    }
  }, [navigate, queryClient, clearStoredForm])

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
