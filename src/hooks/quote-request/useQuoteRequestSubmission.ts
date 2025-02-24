import { useState } from "react"
import { useForm } from "react-hook-form"
import { ServiceFormData } from "@/types/service-item"
import { useQuery, useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useFormStorage } from "./useFormStorage"
import { useMediaHandling } from "./useMediaHandling"
import { toast } from "sonner"

interface QuoteRequestSubmissionResult {
  form: ReturnType<typeof useForm<ServiceFormData>>
  step: number
  totalSteps: number
  services: any[] | undefined
  isSubmitting: boolean
  uploading: boolean
  handleSubmit: (data: ServiceFormData) => Promise<void>
  nextStep: () => void
  prevStep: () => void
  handleImageUpload: (files: FileList) => Promise<string[]>
  handleImageRemove: (url: string) => void
  onVehicleSave: (vehicleInfo: ServiceFormData['vehicleInfo']) => Promise<void>
  selectedServiceId: string | undefined
}

export function useQuoteRequestSubmission(): QuoteRequestSubmissionResult {
  const [step, setStep] = useState(1)
  const { clearFormData: clearStorage } = useFormStorage()
  const [selectedServiceId, setSelectedServiceId] = useState<string>()
  const { uploading, handleImageUpload, handleImageRemove, uploadedUrls } = useMediaHandling()

  const form = useForm<ServiceFormData>({
    defaultValues: {
      vehicleInfo: {
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        saveToAccount: false,
      },
      service_items: [],
      description: '',
      service_details: {},
    }
  })

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('status', 'active')
      
      if (error) throw error
      return data
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session) {
        toast.error("Please sign in to submit a quote request")
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
    }
  })

  const selectedServices = form.watch('service_items')
  const totalSteps = selectedServices.length > 0 ? selectedServices.length + 2 : 2

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

  const onVehicleSave = async (vehicleInfo: ServiceFormData['vehicleInfo']) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!client) throw new Error("No client found")

    const { error } = await supabase
      .from("vehicles")
      .insert({
        client_id: client.id,
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        year: vehicleInfo.year,
        vin: vehicleInfo.vin,
        is_primary: true
      })

    if (error) throw error
  }

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      await mutation.mutateAsync(data)
      clearStorage()
      toast.success("Quote request submitted successfully")
    } catch (error) {
      console.error('Error submitting quote request:', error)
      toast.error("Failed to submit quote request")
    }
  }

  return {
    form,
    step,
    totalSteps,
    services,
    isSubmitting: mutation.isPending,
    uploading,
    handleSubmit,
    nextStep,
    prevStep,
    handleImageUpload,
    handleImageRemove,
    onVehicleSave,
    selectedServiceId
  }
}
