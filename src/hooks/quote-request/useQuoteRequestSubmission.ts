
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ServiceFormData, ServiceItemType } from "@/types/service-item";
import { useFormStorage } from "./useFormStorage";
import { UseFormReturn } from "react-hook-form";

// This is a fixed version of the hook to handle form submission
export function useQuoteRequestSubmission(form: UseFormReturn<ServiceFormData>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Get the form storage functions separately
  const { formData, updateFormData, clearStoredFormData } = useFormStorage();
  
  // Watch for relevant form fields
  const watchedServiceItems = form.watch("service_items") || [];
  const watchedServiceType = form.watch("serviceType");
  
  const submitRequest = async () => {
    try {
      setIsSubmitting(true);
      
      // Get the current form values
      const values = form.getValues();
      
      // Create the request payload
      const payload = {
        customer: {
          vehicle: {
            make: values.vehicleInfo?.make,
            model: values.vehicleInfo?.model,
            year: values.vehicleInfo?.year,
          }
        },
        services: values.service_items || [],
        // Add other relevant data from the form
      };
      
      console.log("Submitting quote request:", payload);
      
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear stored form data on successful submission
      clearStoredFormData();
      
      toast({
        title: "Success!",
        description: "Your quote request has been submitted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error submitting quote request:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your quote request. Please try again.",
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to handle media upload for service details
  const handleMediaUpload = async () => {
    try {
      const values = form.getValues();
      const serviceDetails = values.service_details;
      
      if (!serviceDetails) return [];
      
      const uploads: Promise<string>[] = [];
      
      // Process each service detail's images
      Object.keys(serviceDetails).forEach(serviceId => {
        const images = form.getValues(`details.${serviceId}.images` as any);
        if (images && Array.isArray(images)) {
          // Process image uploads
          // For now, just simulate it
        }
      });
      
      return await Promise.all(uploads);
    } catch (error) {
      console.error("Error uploading media:", error);
      return [];
    }
  };
  
  // Function to save vehicle information
  const saveVehicle = async () => {
    const values = form.getValues();
    if (values.vehicleInfo?.saveToAccount) {
      try {
        // Simulate saving vehicle to account
        console.log("Saving vehicle to account:", values.vehicleInfo);
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      } catch (error) {
        console.error("Error saving vehicle:", error);
        return false;
      }
    }
    return false;
  };
  
  return {
    isSubmitting,
    submitRequest,
    handleMediaUpload,
    saveVehicle
  };
}
