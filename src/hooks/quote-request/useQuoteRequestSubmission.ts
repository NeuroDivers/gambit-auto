
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useQuery } from '@tanstack/react-query'
import type { ServiceFormData } from '@/types/service-item'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export function useQuoteRequestSubmission() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

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

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      setIsSubmitting(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error("Please sign in to submit a quote request")
        navigate("/auth")
        return
      }

      // Get client ID
      const { data: clientData } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", session.user.id)
        .single()

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
      
    } catch (error: any) {
      console.error("Error submitting quote request:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalSteps = services?.length ? services.length + 2 : 2

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  return {
    step,
    totalSteps,
    services,
    isSubmitting,
    handleSubmit,
    nextStep,
    prevStep
  }
}
