
import { useState, useEffect } from "react"
import { ServiceFormData } from "@/types/service-item"
import { useLocalStorage } from "usehooks-ts"

// Default initial form data
const initialFormData: ServiceFormData = {
  vehicleInfo: {
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    saveToAccount: false
  },
  service_items: [],
  description: "",
  service_details: {}
}

export function useFormStorage() {
  // Use useLocalStorage hook for persistent storage
  const [storedFormData, setStoredFormData] = useLocalStorage<ServiceFormData>(
    "quote-request-form-data",
    initialFormData
  )
  
  // Local state to track data
  const [formData, setFormData] = useState<ServiceFormData>(storedFormData)
  
  // Update local state when storage changes
  useEffect(() => {
    setFormData(storedFormData)
  }, [storedFormData])
  
  // Update both local state and storage
  const updateFormData = (newData: Partial<ServiceFormData>) => {
    const updatedData = { ...formData, ...newData }
    setFormData(updatedData)
    setStoredFormData(updatedData)
  }
  
  // Clear form data from storage
  const clearStoredFormData = () => {
    setStoredFormData(initialFormData)
    setFormData(initialFormData)
  }
  
  return {
    formData,
    updateFormData,
    clearStoredFormData
  }
}
