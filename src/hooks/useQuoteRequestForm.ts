
import { useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useFormStorage } from "./quote-request/useFormStorage"
import { FormData, formSchema } from "./quote-request/formSchema"

export function useQuoteRequestForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clearStoredForm } = useFormStorage()

  const form = useForm<FormData>({
    defaultValues: {
      vehicleInfo: {
        make: "",
        model: "",
        year: new Date().getFullYear(),
        vin: ""
      },
      services: [],
      description: "",
      details: {}
    }
  })

  const onSubmit = useCallback(async (data: FormData) => {
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
          service_ids: data.services,
          service_details: data.details
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
    onSubmit
  }
}
