import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useFormStorage } from "./quote-request/useFormStorage"

export function useQuoteRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { formData, updateFormData, clearStoredFormData } = useFormStorage()

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      // Add your submission logic here
      
      // Clear form data
      clearStoredFormData()
      
      toast({
        title: "Success",
        description: "Your quote request has been submitted",
      })
      
      navigate("/client/quote-requests")
    } catch (error) {
      console.error("Error submitting quote request:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit quote request",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    updateFormData,
    isSubmitting,
    handleSubmit
  }
}
