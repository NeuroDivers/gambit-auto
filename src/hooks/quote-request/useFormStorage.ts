
import { ServiceFormData } from "@/types/service-item"
import { useState, useEffect } from "react"
import { useLocalStorage } from "usehooks-ts"

const STORAGE_KEY = "quote_request_form_data"

export function useFormStorage() {
  const [storedFormData, setStoredFormData] = useLocalStorage<ServiceFormData>(
    STORAGE_KEY,
    {
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
  )

  const updateFormData = (newData: Partial<ServiceFormData>) => {
    setStoredFormData(prev => ({
      ...prev,
      ...newData
    }))
  }

  const clearStoredFormData = () => {
    setStoredFormData({
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
    })
  }

  return {
    formData: storedFormData,
    updateFormData,
    clearStoredFormData
  }
}
