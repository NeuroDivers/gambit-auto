
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ServiceFormData } from "@/types/service-item"
import { useFormStorage } from "./useFormStorage"
import { supabase } from "@/integrations/supabase/client"

export function useQuoteRequestSubmission() {
  const navigate = useNavigate()
  const { formData, clearStoredFormData } = useFormStorage()

  const submitQuoteRequest = async (mediaFiles?: File[]) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast.error("You must be logged in to submit a quote request")
        return false
      }

      // Submit the quote request
      const { data: quoteData, error: quoteError } = await supabase
        .from("quote_requests")
        .insert({
          customer_id: user.id,
          vehicle_make: formData.vehicleInfo.make,
          vehicle_model: formData.vehicleInfo.model,
          vehicle_year: formData.vehicleInfo.year,
          vehicle_vin: formData.vehicleInfo.vin,
          description: formData.description,
          service_details: formData.service_details,
          status: "pending"
        })
        .select()
        .single()

      if (quoteError) {
        console.error("Quote request submission error:", quoteError)
        toast.error("Failed to submit quote request")
        return false
      }

      // Clear the form data from local storage
      clearStoredFormData()

      toast.success("Quote request submitted successfully")
      navigate("/client/quotes")
      return true
    } catch (error) {
      console.error("Quote request submission error:", error)
      toast.error("Failed to submit quote request")
      return false
    }
  }

  return { submitQuoteRequest }
}
