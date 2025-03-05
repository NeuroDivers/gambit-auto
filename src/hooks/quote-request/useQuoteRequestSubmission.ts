import { useState } from "react"
import { useForm } from "react-hook-form"
import { ServiceFormData } from "@/types/service-item"
import { zodResolver } from "@hookform/resolvers/zod"
import { formSchema } from "./formSchema"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useFormStorage } from "./useFormStorage"
import { useMediaHandling } from "./useMediaHandling"
import { supabase } from "@/integrations/supabase/client"

export function useQuoteRequestSubmission() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { formData, updateFormData, clearStoredFormData } = useFormStorage()
  const { uploading, uploadedUrls, handleImageUpload, handleImageRemove } = useMediaHandling()

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  })

  const services = form.watch("service_items")
  const totalSteps = services?.length ? services.length + 2 : 2

  const handleSubmit = async () => {
    try {
      const values = form.getValues()
      console.log("Form values:", values)
      
      setIsSubmitting(true)
      
      // Validate required data
      if (!values.vehicleInfo.make || !values.vehicleInfo.model || !values.vehicleInfo.year) {
        toast({
          variant: "destructive",
          title: "Incomplete information",
          description: "Please fill out all vehicle information",
        })
        setIsSubmitting(false)
        return
      }
      
      if (!values.service_items.length) {
        toast({
          variant: "destructive",
          title: "No services selected",
          description: "Please select at least one service",
        })
        setIsSubmitting(false)
        return
      }
      
      // Mock API call to submit quote request
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: "You must be logged in to submit a quote request",
        })
        setIsSubmitting(false)
        return
      }
      
      const quoteRequest = {
        profile_id: user.id,
        vehicle_make: values.vehicleInfo.make,
        vehicle_model: values.vehicleInfo.model,
        vehicle_year: values.vehicleInfo.year,
        vehicle_vin: values.vehicleInfo.vin,
        description: values.description,
        service_details: values.service_details,
        services: values.service_items.map(item => ({
          service_id: item.service_id,
          service_name: item.service_name,
          quantity: item.quantity,
        }))
      }
      
      const { data, error } = await supabase
        .from('quote_requests')
        .insert(quoteRequest)
        .select()
      
      if (error) throw error
      
      // Upload any images if there are any
      if (uploadedUrls.length > 0) {
        // Logic to associate images with the quote request
        console.log("Uploading images for quote request")
      }
      
      clearStoredFormData()
      
      toast({
        title: "Quote request submitted",
        description: "We'll get back to you with a quote soon",
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

  const nextStep = () => {
    if (step < totalSteps) {
      if (step === 1) {
        // Save form data
        updateFormData(form.getValues())
        
        // Set first service ID for service details step
        if (services && services.length > 0) {
          setSelectedServiceId(services[0].service_id)
        }
        setStep(2)
      } else if (step > 1 && step < totalSteps - 1) {
        // Going through service details steps
        const currentServiceIndex = step - 2
        if (services && currentServiceIndex < services.length - 1) {
          setSelectedServiceId(services[currentServiceIndex + 1].service_id)
        }
        setStep(step + 1)
      } else {
        // Go to summary step
        setStep(totalSteps)
      }
      
      // Save form data on each step
      updateFormData(form.getValues())
    }
  }

  const prevStep = () => {
    if (step > 1) {
      if (step === totalSteps) {
        // From summary to last service detail
        if (services && services.length > 0) {
          setSelectedServiceId(services[services.length - 1].service_id)
        }
        setStep(totalSteps - 1)
      } else if (step > 2) {
        // Going backward through service details
        const currentServiceIndex = step - 2
        if (services && currentServiceIndex > 0) {
          setSelectedServiceId(services[currentServiceIndex - 1].service_id)
        }
        setStep(step - 1)
      } else {
        // Go back to first step
        setStep(1)
      }
    }
  }

  const handleImageUploadWrapper = async (files: File[]) => {
    const urls = await handleImageUpload(new DataTransfer().files);
    
    if (selectedServiceId) {
      const serviceDetails = form.getValues().service_details || {}
      const currentImages = serviceDetails[selectedServiceId]?.images || []
      
      // Update form with new images
      form.setValue(`service_details.${selectedServiceId}.images`, [
        ...currentImages,
        ...urls
      ])
      
      // Save to storage
      updateFormData(form.getValues())
    }
    
    return urls;
  }

  const handleImageRemoveWrapper = async (imageUrl: string) => {
    await handleImageRemove(imageUrl)
    
    if (selectedServiceId) {
      const serviceDetails = form.getValues().service_details || {}
      const currentImages = serviceDetails[selectedServiceId]?.images || []
      
      // Remove image from form
      form.setValue(
        `service_details.${selectedServiceId}.images`,
        currentImages.filter(url => url !== imageUrl)
      )
      
      // Save to storage
      updateFormData(form.getValues())
    }
  }

  const onVehicleSave = async (vehicleInfo: any) => {
    form.setValue('vehicleInfo', {
      ...form.getValues().vehicleInfo,
      ...vehicleInfo
    })
    updateFormData(form.getValues())
    return Promise.resolve();
  }

  const submitQuoteRequest = async (mediaFiles?: File[]) => {
    try {
      setIsSubmitting(true)
      
      if (mediaFiles && mediaFiles.length > 0) {
        await handleImageUploadWrapper(mediaFiles)
      }
      
      await handleSubmit()
      return true
    } catch (error) {
      console.error("Error submitting quote request:", error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    step,
    totalSteps,
    services,
    isSubmitting,
    uploading,
    handleSubmit,
    nextStep,
    prevStep,
    handleImageUpload: handleImageUploadWrapper,
    handleImageRemove: handleImageRemoveWrapper,
    onVehicleSave,
    selectedServiceId,
    submitQuoteRequest
  }
}
