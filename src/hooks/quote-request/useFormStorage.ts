import { useEffect, useState } from "react"
import { FormStorage } from "./types"
import { ServiceFormData } from "@/types/service-item"

const storageKey = "quote-form-data"

export function useFormStorage() {
  const [data, setDataState] = useState<ServiceFormData | null>(null)
  const [step, setStepState] = useState(1)

  useEffect(() => {
    const storedData = localStorage.getItem(storageKey)
    if (storedData) {
      const parsedData: FormStorage = JSON.parse(storedData)
      setDataState(parsedData.data)
      setStepState(parsedData.step)
    }
  }, [])

  const getData = (): ServiceFormData => {
    const storedData = localStorage.getItem(storageKey)
    return storedData ? JSON.parse(storedData) : {
      vehicleInfo: {
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        saveToAccount: false,
      },
      service_items: [],
      description: '',
      service_details: {}
    }
  }

  const setStep = (step: number) => {
    setStepState(step)
    const storedData = getData()
    localStorage.setItem(storageKey, JSON.stringify({ step, data: storedData }))
  }

  const setData = (data: Partial<ServiceFormData>) => {
    const storedData = getData()
    const newData = {
      ...storedData,
      ...data,
      vehicleInfo: {
        ...storedData.vehicleInfo,
        ...data.vehicleInfo,
        year: data.vehicleInfo?.year ? Number(data.vehicleInfo.year) : storedData.vehicleInfo?.year
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(newData))
  }

  const clearStorage = () => {
    localStorage.removeItem(storageKey)
    setDataState(null)
    setStepState(1)
  }

  return {
    data,
    step,
    setStep,
    setData,
    getData,
    clearStorage
  }
}
