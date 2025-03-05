
import { ReactNode } from "react"
import { UseFormReturn } from "react-hook-form"
import { ServiceFormData } from "@/types/service-item"

export interface ServiceDetailFieldProps {
  form: UseFormReturn<ServiceFormData>
  serviceId: string
}

export interface ServiceImageUploadProps {
  images: string[]
  onImageUpload: (files: FileList) => Promise<string[]>
  onImageRemove: (url: string) => void
}

export interface FormNavigationProps {
  step: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  isSubmitting: boolean
  uploading: boolean
}

// Add the missing interface for VehicleInfoStep
export interface VehicleInfoStepProps {
  form: UseFormReturn<ServiceFormData>
  onVehicleSave: (vehicleInfo: { 
    make: string
    model: string
    year: number
    vin: string
    saveToAccount?: boolean
  }) => Promise<void>
}

// Add the missing interface for ServiceDetailsStep
export interface ServiceDetailsStepProps {
  form: UseFormReturn<ServiceFormData>
  services: { id: string; name: string; base_price: number; description?: string; hierarchy_type?: string }[]
  serviceId: string | null
  onImageUpload: (files: FileList) => Promise<string[]>
  onImageRemove: (url: string) => void
}

// Add the missing interface for SummaryStep
export interface SummaryStepProps {
  form: UseFormReturn<ServiceFormData>
  services: { id: string; name: string; base_price: number; description?: string }[]
}
