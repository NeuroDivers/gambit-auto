
import { useCallback, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import type { QuoteRequestFormData, ServiceItemType } from "@/types/quote-request"
import { zodResolver } from "@hookform/resolvers/zod"
import { formSchema } from "./quote-request/formSchema"
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
      make: defaultVehicle?.make ?? "",
      model: defaultVehicle?.model ?? "",
      year: defaultVehicle?.year ?? new Date().getFullYear(),
      vin: defaultVehicle?.vin ?? "",
      saveToAccount: false,
      isPrimary: false
    },
    service_items: [] satisfies ServiceItemType[],
    description: "",
    service_details: {}
  }

  const form = useForm<QuoteRequestFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues
  })

  // Update form values when default vehicle is loaded
  useEffect(() => {
    if (defaultVehicle) {
      form.setValue('vehicleInfo', {
        make: defaultVehicle.make,
        model: defaultVehicle.model,
        year: defaultVehicle.year,
        vin: defaultVehicle.vin ?? "",
        saveToAccount: false,
        isPrimary: false
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
      console.log("Starting quote request submission with data:", data)

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error("Session error:", sessionError)
        throw sessionError
      }
      if (!session) {
        toast.error("Please sign in to submit a quote request")
        navigate("/auth")
        return
      }

      // Get client ID
      console.log("Fetching client ID for user:", session.user.id)
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle()

      if (clientError) {
        console.error("Client fetch error:", clientError)
        throw clientError
      }
      if (!clientData) {
        console.error("No client account found for user:", session.user.id)
        toast.error("No client account found")
        return
      }

      // If saving vehicle to account, create vehicle first
      if (data.vehicleInfo.saveToAccount) {
        console.log("Saving vehicle to account:", {
          clientId: clientData.id,
          vehicleInfo: data.vehicleInfo
        })

        const { error: vehicleError } = await supabase
          .from("vehicles")
          .insert({
            client_id: clientData.id,
            make: data.vehicleInfo.make,
            model: data.vehicleInfo.model,
            year: data.vehicleInfo.year,
            vin: data.vehicleInfo.vin || null,
            is_primary: data.vehicleInfo.isPrimary || false
          })

        if (vehicleError) {
          console.error("Vehicle creation error:", vehicleError)
          throw vehicleError
        }
      }

      // Create quote request
      console.log("Creating quote request:", {
        clientId: clientData.id,
        serviceIds: data.service_items.map(item => item.service_id),
        uploadedUrls
      })

      const { error: insertError } = await supabase
        .from("quote_requests")
        .insert({
          client_id: clientData.id,
          vehicle_make: data.vehicleInfo.make,
          vehicle_model: data.vehicleInfo.model,
          vehicle_year: data.vehicleInfo.year,
          vehicle_vin: data.vehicleInfo.vin || null,
          description: data.description || "",
          service_ids: data.service_items.map(item => item.service_id),
          service_details: data.service_details || {},
          media_urls: uploadedUrls,
          status: "pending"
        })

      if (insertError) {
        console.error("Quote request creation error:", insertError)
        throw insertError
      }

      console.log("Quote request created successfully")
      // Clear form storage
      clearStoredForm()
      
      toast.success("Quote request submitted successfully!")
      navigate("/client/quotes")
    } catch (error: any) {
      console.error("Error submitting quote request:", error)
      toast.error(error.message || "Failed to submit quote request")
      throw error
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
