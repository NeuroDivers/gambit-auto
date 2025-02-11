
import { FormStorage } from "./types"

const STORAGE_KEY = 'quote_request_form_data'

export function useFormStorage() {
  const loadSavedFormData = (): FormStorage => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        return JSON.parse(savedData)
      } catch (error) {
        console.error('Error parsing saved form data:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    return {
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear().toString(),
      vehicle_vin: "",
      service_items: [],
      description: "",
      service_details: {}
    }
  }

  const saveFormData = (data: any) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const clearFormData = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    loadSavedFormData,
    saveFormData,
    clearFormData
  }
}
