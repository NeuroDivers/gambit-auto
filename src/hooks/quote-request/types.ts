
import { ServiceItemType } from "@/components/work-orders/types"
import { QuoteRequestFormData } from "@/components/client/quotes/form-steps/types"
import { UseFormReturn } from "react-hook-form"

export type UseQuoteRequestFormReturn = {
  form: UseFormReturn<QuoteRequestFormData>
  step: number
  totalSteps: number
  services: any[]
  selectedServices: ServiceItemType[]
  uploading: boolean
  isSubmitting: boolean
  handleImageUpload: (files: FileList, serviceId: string) => Promise<void>
  handleImageRemove: (url: string, serviceId: string) => void
  onSubmit: (values: QuoteRequestFormData) => Promise<void>
  nextStep: () => void
  prevStep: () => void
}

export type FormStorage = {
  vehicle_make: string
  vehicle_model: string
  vehicle_year: string
  vehicle_vin: string
  service_items: ServiceItemType[]
  description: string
  service_details: Record<string, any>
}
