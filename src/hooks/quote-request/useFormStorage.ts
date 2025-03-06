
import { FormStorage } from "./types"
import { ServiceFormData } from "@/types/service-item"

const storageKey = "quote_request_form"

export function useFormStorage() {
  const getData = (): FormStorage => {
    const stored = localStorage.getItem(storageKey)
    if (!stored) {
      return {
        step: 1,
        data: {
          vehicleInfo: {
            make: "",
            model: "",
            year: new Date().getFullYear(),
            vin: "",
          },
          service_items: [],
          description: "",
          service_details: {}
        }
      }
    }
    return JSON.parse(stored)
  }

  const setData = (data: Partial<ServiceFormData>) => {
    const stored = getData()
    localStorage.setItem(storageKey, JSON.stringify({
      ...stored,
      data: {
        ...stored.data,
        ...data
      }
    }))
  }

  const setStep = (step: number) => {
    const stored = getData()
    localStorage.setItem(storageKey, JSON.stringify({
      ...stored,
      step
    }))
  }

  const clearFormData = () => {
    localStorage.removeItem(storageKey)
  }

  return {
    data: getData().data,
    step: getData().step,
    setStep,
    setData,
    getData,
    clearFormData
  }
}
