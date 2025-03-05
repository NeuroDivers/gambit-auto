
import { useState, useEffect } from "react";
import { ServiceFormData } from "@/types/service-item";

export function useFormStorage() {
  // Initialize with the default form state
  const initialFormData: ServiceFormData = {
    serviceType: "",
    details: {},
    images: [],
    description: "",
    vehicleInfo: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      saveToAccount: false,
    },
    service_items: [],
    service_details: {}
  };

  const [formData, setFormData] = useState<ServiceFormData>(
    () => {
      try {
        const saved = localStorage.getItem("quote_request_form");
        return saved ? JSON.parse(saved) : initialFormData;
      } catch (error) {
        console.error("Error loading form data:", error);
        return initialFormData;
      }
    }
  );

  // Updates form data and stores in localStorage
  const updateFormData = (data: Partial<ServiceFormData>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    
    try {
      localStorage.setItem("quote_request_form", JSON.stringify(updatedData));
    } catch (error) {
      console.error("Error saving form data:", error);
    }
  };

  // Clears the stored form data
  const clearStoredFormData = () => {
    setFormData(initialFormData);
    localStorage.removeItem("quote_request_form");
  };

  return { formData, updateFormData, clearStoredFormData };
}
