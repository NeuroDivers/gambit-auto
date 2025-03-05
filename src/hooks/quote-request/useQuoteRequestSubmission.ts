
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ServiceFormData, ServiceItemType, QuoteRequestSubmissionHook } from "@/types/service-item";
import { useFormStorage } from "./useFormStorage";
import { UseFormReturn } from "react-hook-form";

// This is an expanded version of the hook to handle form submission with all the required properties
export function useQuoteRequestSubmission(): QuoteRequestSubmissionHook {
  const [step, setStep] = useState(1);
  const totalSteps = 3; // Define the total number of steps
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceItemType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<UseFormReturn<ServiceFormData>>(null);
  const { toast } = useToast();
  
  // Get the form storage functions separately
  const { formData, updateFormData, clearStoredFormData } = useFormStorage();
  
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };
  
  const handleSubmit = async (values: ServiceFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      
      // Create the request payload
      const payload = {
        customer: {
          vehicle: {
            make: values.vehicleInfo?.make || "",
            model: values.vehicleInfo?.model || "",
            year: values.vehicleInfo?.year || 0,
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
    } catch (error) {
      console.error("Error submitting quote request:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your quote request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to handle media upload for service details
  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    try {
      setUploading(true);
      console.log("Uploading images:", files);
      
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock URLs
      return files.map((_, i) => `https://example.com/image_${i}.jpg`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Could not upload images. Please try again.",
      });
      return [];
    } finally {
      setUploading(false);
    }
  };
  
  // Function to handle image removal
  const handleImageRemove = (url: string): void => {
    console.log("Removing image:", url);
    // Image removal logic would go here
  };
  
  // Function to save vehicle information
  const onVehicleSave = async (vehicleInfo: {
    make: string;
    model: string;
    year: number;
    vin: string;
    saveToAccount?: boolean;
  }): Promise<void> => {
    console.log("Saving vehicle data:", vehicleInfo);
  };
  
  return {
    step,
    totalSteps,
    services,
    isSubmitting,
    uploading,
    handleSubmit,
    nextStep,
    prevStep,
    handleImageUpload,
    handleImageRemove,
    onVehicleSave,
    selectedServiceId,
    submitRequest: handleSubmit,
    handleMediaUpload: handleImageUpload,
    saveVehicle: onVehicleSave
  };
}
